# Subscriber Pattern — Reference

## Abstract `Subscriber` (application)

**Zero framework imports** — a plain class:

```typescript
// src/shared/application/subscriber.ts
import { type DomainEvent } from '@/shared/domain/domain-event.js';
import { type DomainEventConsumer } from './domain-event-consumer.js';

type DomainEventClass = new (...args: never) => DomainEvent;

export abstract class Subscriber {
  abstract get queueName(): string;
  abstract get eventName(): string;
  abstract get exchangeName(): string;
  abstract get domainEvent(): DomainEventClass;

  abstract on(event: DomainEvent): Promise<void>;

  constructor(protected readonly consumer: DomainEventConsumer) {}

  async init(): Promise<void> {
    await this.consumer.consume(
      this.queueName,
      this.eventName,
      this.exchangeName,
      this.domainEvent,
      this.on.bind(this),
    );
  }
}
```

> **Why `never` in `DomainEventClass`?**
> In TypeScript, function and constructor parameters are **contravariant**.
> `unknown[]` would make any subclass with typed parameters fail.
> `never` in parameter position is the correct supertype — it accepts any
> constructor signature without needing `any` or disabling a lint rule.

## Concrete subscriber — full example

The subscriber lives **next to the use case it triggers**, not in its own `subscribers/` folder:

```
progress/application/
  update/
    product-stats-updater.ts                        ← use case
    category-stats-updater.ts                 ← use case
    update-product-stats-on-payment-recorded.ts     ← subscriber
```

```typescript
// src/progress/application/update/update-product-stats-on-payment-recorded.ts
import { Subscriber } from '@/shared/application/subscriber.js';
import {
  type DomainEventConsumer,
  DOMAIN_EVENT_CONSUMER,
} from '@/shared/application/domain-event-consumer.js';
import { type DomainEvent } from '@/shared/domain/domain-event.js';
import {
  PaymentRecordedEvent,
  type PaymentRecordedAttributes,
} from '@/sales/domain/events/payment-recorded.event.js';
import { ProductStatsUpdater } from './product-stats-updater.js';
import { CategoryStatsUpdater } from './category-stats-updater.js';

export class ProductStatsUpdaterOnPaymentRecorded extends Subscriber {
  readonly queueName = 'progress.update_product_stats_on_payment_recorded';
  readonly eventName = 'myapp.sales.payments.payment.recorded';
  readonly exchangeName = 'myapp.sales.payments.payment.recorded';
  readonly domainEvent = PaymentRecordedEvent;

  constructor(
    consumer: DomainEventConsumer,
    private readonly productStatsUpdater: ProductStatsUpdater,
    private readonly categoryStatsUpdater: CategoryStatsUpdater,
  ) {
    super(consumer);
  }

  async on(event: DomainEvent): Promise<void> {
    const attrs = event.attributes as PaymentRecordedAttributes;
    if (attrs.userId === null) return;

    await this.productStatsUpdater.execute({
      userId: attrs.userId,
      productId: attrs.productId,
      approved: attrs.approved,
      mode: attrs.mode,
    });

    if (attrs.mode === 'order') {
      await this.categoryStatsUpdater.executeForOrderPayment({
        userId: attrs.userId,
        orderId: attrs.orderId,
        productId: attrs.productId,
      });
    }
  }
}
```

## `SubscribersBootstrapper` (infrastructure)

At startup, it initializes every subscriber listed under the `SUBSCRIBERS` token:

```typescript
await Promise.all(this.subscribers.map((s) => s.init()));
```

`DOMAIN_EVENT_CONSUMER` and `DOMAIN_EVENT_PUBLISHER` are provided in the shared module — they do not need to be redeclared in each BC module.

## Domain — `DomainEventPublisher` interface

```typescript
// src/shared/domain/domain-event-publisher.ts
export interface DomainEventPublisher {
  publish(events: DomainEvent[]): Promise<void>;
}

export const DOMAIN_EVENT_PUBLISHER = Symbol('DomainEventPublisher');
```

## Application — `DomainEventConsumer` interface

```typescript
// src/shared/application/domain-event-consumer.ts
export interface DomainEventConsumer {
  consume(
    queueName: string,
    eventName: string,
    exchangeName: string,
    domainEvent: new (...args: unknown[]) => DomainEvent,
    handler: (event: DomainEvent) => Promise<void>,
  ): Promise<void>;
}

export const DOMAIN_EVENT_CONSUMER = Symbol('DomainEventConsumer');
```
