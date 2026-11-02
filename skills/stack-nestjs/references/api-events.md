# api-events with NestJS

Apply the rules of `api-events`. This reference shows the NestJS wiring.

## Rules

- Abstract `Subscriber` — **zero imports from `@nestjs/common`**.
- `@Inject` + `@Injectable` on the concrete subscriber are the only allowed exception.
- `OnModuleInit` lives in infrastructure (`SubscribersBootstrapper`) — never in application.

## Layers and responsibilities

```
Domain         → DomainEvent, DomainEventPublisher interface
Application    → Subscriber (abstract), DomainEventConsumer interface
Infrastructure → AmqpMessageBus, SubscribersBootstrapper, NestJS modules
```

## Concrete subscriber

```typescript
// src/progress/application/update/update-product-stats-on-payment-recorded.ts
import { Inject, Injectable } from '@nestjs/common';
import { Subscriber } from '@/shared/application/subscriber';
import {
  type DomainEventConsumer,
  DOMAIN_EVENT_CONSUMER,
} from '@/shared/application/domain-event-consumer';
import { type DomainEvent } from '@/shared/domain/domain-event';
import {
  PaymentRecordedEvent,
  type PaymentRecordedAttributes,
} from '@/sales/domain/events/payment-recorded.event';
import { ProductStatsUpdater } from './product-stats-updater';
import { CategoryStatsUpdater } from './category-stats-updater';

@Injectable()
export class ProductStatsUpdaterOnPaymentRecorded extends Subscriber {
  readonly queueName = 'progress.update_product_stats_on_payment_recorded';
  readonly eventName = 'myapp.sales.payments.payment.recorded';
  readonly exchangeName = 'myapp.sales.payments.payment.recorded';
  readonly domainEvent = PaymentRecordedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    @Inject(ProductStatsUpdater)
    private readonly productStatsUpdater: ProductStatsUpdater,
    @Inject(CategoryStatsUpdater)
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

```typescript
// src/shared/infrastructure/event-bus/subscribers-bootstrapper.ts
export const SUBSCRIBERS = Symbol('Subscribers');

@Injectable()
export class SubscribersBootstrapper implements OnModuleInit {
  constructor(@Inject(SUBSCRIBERS) private readonly subscribers: Subscriber[]) {}

  async onModuleInit(): Promise<void> {
    await Promise.all(this.subscribers.map((s) => s.init()));
  }
}
```

## Registration in a NestJS module

```typescript
@Module({
  providers: [
    // Use cases
    ProductStatsUpdater,
    CategoryStatsUpdater,

    // Event subscribers
    ProductStatsUpdaterOnPaymentRecorded,
    {
      provide: SUBSCRIBERS,
      useFactory: (s1: ProductStatsUpdaterOnPaymentRecorded): Subscriber[] => [s1],
      inject: [ProductStatsUpdaterOnPaymentRecorded],
    },
    SubscribersBootstrapper,
  ],
})
export class ProgressModule {}
```

> `DOMAIN_EVENT_CONSUMER` and `DOMAIN_EVENT_PUBLISHER` are provided in `SharedModule` — they do not need to be redeclared in each BC module.

## Why not NestJS EventEmitter?

NestJS EventEmitter is in-process — if the process dies, events are lost. RabbitMQ is durable and allows retry, DLQ and distribution across multiple instances. For a production system, the async bus is the right choice.
