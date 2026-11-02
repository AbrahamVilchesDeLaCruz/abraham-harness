# Subscriber Pattern — Reference

## `Subscriber` abstract (application)

**Cero imports de NestJS** — clase pura:

```typescript
// src/shared/application/subscriber.ts
import { type DomainEvent } from '@/shared/domain/domain-event';
import { type DomainEventConsumer } from './domain-event-consumer';

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

> **¿Por qué `never` en `DomainEventClass`?**
> En TypeScript los parámetros de funciones/constructores son **contravariantes**.
> `unknown[]` haría fallar a cualquier subclase con parámetros tipados.
> `never` en posición de parámetro es el supertipo correcto — acepta cualquier
> firma de constructor sin necesitar `any` ni `eslint-disable`.

## Subscriber concreto — ejemplo completo

El subscriber vive **junto al use case que dispara**, no en una carpeta `subscribers/` propia:

```
progress/application/
  update/
    product-stats-updater.ts                        ← use case
    random-module-progress-updater.ts                 ← use case
    update-product-stats-on-payment-recorded.ts     ← subscriber
```

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
import { RandomModuleProgressUpdater } from './random-module-progress-updater';

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
    @Inject(RandomModuleProgressUpdater)
    private readonly randomModuleProgressUpdater: RandomModuleProgressUpdater,
  ) {
    super(consumer);
  }

  async on(event: DomainEvent): Promise<void> {
    const attrs = event.attributes as PaymentRecordedAttributes;
    if (attrs.userId === null) return;

    await this.productStatsUpdater.execute({
      userId: attrs.userId,
      productId: attrs.productId,
      correct: attrs.correct,
      mode: attrs.mode,
    });

    if (attrs.mode === 'order') {
      await this.randomModuleProgressUpdater.executeForRandomPayment({
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

## Registro en módulo NestJS

```typescript
@Module({
  providers: [
    // Use cases
    ProductStatsUpdater,
    RandomModuleProgressUpdater,

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

> `DOMAIN_EVENT_CONSUMER` y `DOMAIN_EVENT_PUBLISHER` se proveen en `SharedModule` — no es necesario redeclararlos en cada módulo de BC.
