# api-events-infra with RabbitMQ

Apply the rules of `api-events-infra`. This reference shows the RabbitMQ implementation with amqplib.

## Rules

`AmqpMessageBus` implements **three interfaces** at once:

```
DomainEventPublisher (domain)  → publish(events)
DomainEventConsumer (app)      → consume(queue, eventName, exchange, DomainEventClass, handler)
OnModuleDestroy (NestJS)       → onModuleDestroy() — closes channel + connection on shutdown
```

- `AmqpMessageBus` lives in `shared/infrastructure/` — it cuts across all BCs.
- `prefetch(1)` always — sequential processing per consumer.
- `AmqpMessageBus` reconnects automatically: when the connection closes, it waits `RECONNECT_DELAY_MS` and re-registers all consumers.

## Retry policy

| Attempt | Delay | Mechanism |
|---|---|---|
| 1 | 1 s | Fixed TTL in `.retry.1000` → returns via DLX |
| 2 | 5 s | Fixed TTL in `.retry.5000` → returns via DLX |
| 3 | 10 s | Fixed TTL in `.retry.10000` → returns via DLX |
| 4 | — | → `.dead_letter` — manual intervention |

Each delay has its own fixed-TTL queue so short retries cannot wait behind a longer interval in that queue.

Queues created automatically in `setupQueues()`: `{queueName}`, `{queueName}.retry.<delay>`, `{queueName}.dead_letter`.

## Full `AmqpMessageBus`

```typescript
// src/shared/infrastructure/event-bus/amqp-message-bus.ts
import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  connect,
  type ChannelModel,
  type ConfirmChannel,
  type ConsumeMessage,
} from 'amqplib';
import { type DomainEvent } from '@/shared/domain/domain-event.js';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher.js';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer.js';
import { type Logger } from '@/shared/domain/logger.js';
import { LOGGER_SERVICE } from '@/shared/domain/logger.js';
import { InvalidEventPayload } from '@/shared/domain/exceptions/invalid-event-payload.js';

const RETRY_DELAYS = [1000, 5000, 10000]; // ms — exponential backoff
const RECONNECT_DELAY_MS = 5000;

type ConsumerRegistration = {
  queueName: string;
  eventName: string;
  exchangeName: string;
  DomainEventClass: new (...args: unknown[]) => DomainEvent;
  handler: (event: DomainEvent) => Promise<void>;
};

@Injectable()
export class AmqpMessageBus
  implements DomainEventPublisher, DomainEventConsumer, OnModuleDestroy
{
  private model: ChannelModel | null = null;
  /** Mutex: prevents concurrent connect() calls from creating two connections */
  private modelPromise: Promise<ChannelModel> | null = null;
  private channelPromise: Promise<ConfirmChannel> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  private stopping = false;
  private readonly registeredConsumers: ConsumerRegistration[] = [];

  constructor(
    @Inject(LOGGER_SERVICE) private readonly logger: Logger,
    private readonly config: ConfigService,
  ) {}

  async onModuleDestroy(): Promise<void> {
    this.stopping = true;
    clearTimeout(this.reconnectTimer);
    await this.model?.close().catch(() => undefined);
    this.channelPromise = null;
    this.model = null;
    this.modelPromise = null;
  }

  // ── Setup ────────────────────────────────────────────────────────────────

  private async setupQueues(
    queueName: string,
    exchangeName: string,
    bindingKey: string,
  ): Promise<void> {
    const ch = await this.getChannel();

    // Exchange type is always 'direct' — hardcoded, not from config
    await ch.assertExchange(exchangeName, 'direct', { durable: true });

    await ch.assertQueue(queueName, { durable: true });
    for (const delay of RETRY_DELAYS) {
      await ch.assertQueue(`${queueName}.retry.${delay}`, {
        durable: true,
        arguments: {
          'x-message-ttl': delay,
          'x-dead-letter-exchange': '',
          'x-dead-letter-routing-key': queueName,
        },
      });
    }
    await ch.assertQueue(`${queueName}.dead_letter`, { durable: true });

    await ch.bindQueue(queueName, exchangeName, bindingKey);
    this.logger.info('Queues set up', { queueName, exchangeName });
  }

  // ── Consume ───────────────────────────────────────────────────────────────

  async consume(
    queueName: string,
    eventName: string,
    exchangeName: string,
    DomainEventClass: new (...args: unknown[]) => DomainEvent,
    handler: (event: DomainEvent) => Promise<void>,
  ): Promise<void> {
    const registration = { queueName, eventName, exchangeName, DomainEventClass, handler };
    await this.attachConsumer(registration);
    this.registeredConsumers.push(registration);
  }

  private async attachConsumer(registration: ConsumerRegistration): Promise<void> {
    const { queueName, eventName, exchangeName, DomainEventClass, handler } = registration;
    await this.setupQueues(queueName, exchangeName, eventName);
    const ch = await this.getChannel();
    await ch.prefetch(1);

    await ch.consume(queueName, (msg: ConsumeMessage | null) => {
      void (async (): Promise<void> => {
        if (!msg) return;
        try {
          const message = JSON.parse(msg.content.toString()) as Record<string, unknown>;
          const event = this.instantiateDomainEvent(DomainEventClass, message);
          await handler(event);
          try {
            ch.ack(msg);
          } catch {
            // Channel may have been closed during shutdown.
          }
        } catch (error) {
          try {
            await this.handleRetry(ch, msg, queueName, error as Error);
            ch.ack(msg);
          } catch (publishError) {
            this.logger.error('Retry publication was not confirmed', publishError as Error, { queueName });
            // Closing the connection releases unacknowledged deliveries.
            // Its close handler restores the consumers after a delay.
            await this.model?.close().catch(() => undefined);
          }
        }
      })();
    });

    this.logger.info('Consumer registered', { queueName });
  }

  // ── Publish ───────────────────────────────────────────────────────────────

  /**
   * Invokes registered in-process handlers without publishing to RabbitMQ.
   * Used by E2E tests to avoid flaky cross-BC async delivery in CI.
   */
  async dispatchInProcess(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      const eventName = event.eventName();
      for (const reg of this.registeredConsumers) {
        if (reg.eventName !== eventName) continue;
        const domainEvent = this.instantiateDomainEvent(reg.DomainEventClass, {
          aggregateId: event.aggregateId,
          eventId: event.eventId,
          occurredOn: event.occurredOn.toISOString(),
          data: event.attributes,
        });
        await reg.handler(domainEvent);
      }
    }
  }

  async publish(events: DomainEvent[]): Promise<void> {
    const ch = await this.getChannel();

    for (const event of events) {
      // Each event has its own exchange named after the eventName
      const exchangeName = event.eventName();
      await ch.assertExchange(exchangeName, 'direct', { durable: true });
      ch.publish(
        exchangeName,
        event.eventName(),
        Buffer.from(
          JSON.stringify({
            aggregateId: event.aggregateId,
            eventId: event.eventId,
            occurredOn: event.occurredOn,
            data: event.attributes, // ← "data" field, not "attributes" nor toPrimitives()
          }),
        ),
        {
          contentType: 'application/json',
          messageId: event.eventId,
          timestamp: event.occurredOn.getTime(),
          deliveryMode: 2,
          headers: { retries: 0, type: event.eventName() },
        },
      );
    }
    await ch.waitForConfirms();
  }

  // ── Retry & DLQ ───────────────────────────────────────────────────────────

  private async handleRetry(
    ch: ConfirmChannel,
    msg: ConsumeMessage,
    queueName: string,
    error: Error,
  ): Promise<void> {
    const stored = msg.properties.headers?.retries;
    const retryCount = typeof stored === 'number' && Number.isInteger(stored) && stored >= 0 ? stored : 0;
    const delay = RETRY_DELAYS[retryCount];
    const target = delay === undefined
      ? `${queueName}.dead_letter`
      : `${queueName}.retry.${delay}`;
    const headers = delay === undefined
      ? { ...msg.properties.headers, reason: 'handler_failed', exhaustedAt: new Date().toISOString() }
      : { ...msg.properties.headers, retries: retryCount + 1 };
    if (delay === undefined) {
      this.logger.error('Message exhausted retries', error, { queueName });
    }
    await new Promise<void>((resolve, reject) => {
      ch.sendToQueue(target, msg.content, {
        persistent: true,
        contentType: msg.properties.contentType,
        messageId: msg.properties.messageId,
        headers,
      }, (failure) => failure ? reject(failure) : resolve());
    });
  }

  // ── Connection ────────────────────────────────────────────────────────────

  private async getModel(): Promise<ChannelModel> {
    if (!this.modelPromise) {
      const uri = this.config.getOrThrow<string>('AMQP_URI'); // direct env var
      this.modelPromise = connect(uri)
        .then((model) => {
          this.model = model;
          model.on('close', () => {
            this.logger.warn('AMQP connection closed — scheduling reconnect');
            this.model = null;
            this.modelPromise = null;
            this.channelPromise = null;
            this.scheduleReconnect();
          });
          model.on('error', (err: Error) => {
            this.logger.error('AMQP connection error', err, {});
          });
          return model;
        })
        .catch((err: Error) => {
          this.modelPromise = null;
          throw err;
        });
    }
    return this.modelPromise;
  }

  private scheduleReconnect(): void {
    if (this.stopping || this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      void this.reconnect();
    }, RECONNECT_DELAY_MS);
  }

  private async reconnect(): Promise<void> {
    this.logger.info('AMQP reconnecting…', {});
    try {
      await this.getModel();
      for (const reg of this.registeredConsumers) {
        await this.attachConsumer(reg);
      }
      this.logger.info('AMQP reconnected and consumers restored', { consumers: this.registeredConsumers.length });
    } catch (err) {
      this.logger.error('AMQP reconnect failed — retrying', err as Error, {});
      await this.model?.close().catch(() => undefined);
      this.scheduleReconnect();
    }
  }

  private getChannel(): Promise<ConfirmChannel> {
    this.channelPromise ??= this.getModel()
      .then(async (model) => {
        const channel = await model.createConfirmChannel();
        channel.on('error', (error) => {
          this.logger.error('AMQP channel failed', error, {});
          void model.close().catch(() => undefined);
        });
        channel.on('close', () => {
          if (this.model === model && !this.stopping) {
            void model.close().catch(() => undefined);
          }
        });
        return channel;
      })
      .catch((error: Error) => {
        this.channelPromise = null;
        throw error;
      });
    return this.channelPromise;
  }

  private instantiateDomainEvent(
    DomainEventClass: new (...args: unknown[]) => DomainEvent,
    message: Record<string, unknown>,
  ): DomainEvent {
    // The payload uses the "data" field for attributes — validate its presence
    if (!message.data) {
      throw new InvalidEventPayload('Missing event data');
    }
    return new DomainEventClass(
      message.aggregateId,
      message.data,
      message.eventId,
      message.occurredOn ? new Date(message.occurredOn as string) : undefined,
    );
  }
}
```

## DLQ recovery

```bash
# Generic pattern — replace with the real queue
rabbitmqadmin move messages \
  --source-queue=<queue_name>.dead_letter \
  --destination-queue=<queue_name>

# Real example:
rabbitmqadmin move messages \
  --source-queue=enrich_product_on_product_created.dead_letter \
  --destination-queue=enrich_product_on_product_created
```

## Retry delivery guarantees

Publish exactly one replacement to the selected delay queue or final DLQ. Acknowledge the original after broker confirmation. On failure, leave it recoverable and restore consumption with backoff. A confirmation and the original acknowledgement are separate operations, so use idempotent handlers. When broker policies are managed outside the app, verify the expected topology and routability before enabling consumers. Provision a migration for existing queue declaration arguments; redeclaring an existing queue with different arguments can fail.

## External Documentation

- [RabbitMQ — Dead Letter Exchanges](https://www.rabbitmq.com/docs/dlx) — how the DLQ works
- [RabbitMQ — TTL (per-message)](https://www.rabbitmq.com/docs/ttl#per-message-ttl-in-publishers) — per-message `expiration` for exponential backoff
- [amqplib — Channel API](https://amqp-node.github.io/amqplib/channel_api.html) — `assertQueue`, `consume`, `ack`, `nack`, `publish`
