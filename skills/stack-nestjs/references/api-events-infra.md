# api-events-infra with NestJS

Apply the rules of `api-events-infra`. This reference shows the NestJS wiring of the message bus. The bus itself is in `stack-rabbitmq`, in `references/api-events-infra.md`.

## Rules

- `SubscribersBootstrapper` calls `subscriber.init()` in `onModuleInit()` — it registers all consumers at startup.
- `AmqpMessageBus` is registered **only once** in `SharedModule` as a singleton via `useExisting`; BC modules do not re-register it.
- `SubscribersBootstrapper` and the `SUBSCRIBERS` token are imported from shared.
- `OnModuleInit` goes only in `SubscribersBootstrapper` — never in subscribers or use cases.
- `SUBSCRIBERS` is registered with `useFactory`, which returns an array of subscribers — never `useExisting + multi: true`.

## `SubscribersBootstrapper`

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

## Registration in NestJS modules

`AmqpMessageBus` is registered **only once** in `SharedModule` as a singleton:

```typescript
// shared/infrastructure/framework/shared.module.ts
@Global()
@Module({
  providers: [
    AmqpMessageBus,
    { provide: DOMAIN_EVENT_PUBLISHER, useExisting: AmqpMessageBus },
    { provide: DOMAIN_EVENT_CONSUMER, useExisting: AmqpMessageBus },
    // ...
  ],
  exports: [DOMAIN_EVENT_PUBLISHER, DOMAIN_EVENT_CONSUMER, /* ... */],
})
export class SharedModule {}
```

BC modules do NOT re-register `AmqpMessageBus`. They only register their subscribers via a `useFactory` that returns an array:

```typescript
// sales/infrastructure/framework/sales.module.ts
import { SUBSCRIBERS, SubscribersBootstrapper } from '@/shared/infrastructure/event-bus/subscribers-bootstrapper.js';
import { type Subscriber } from '@/shared/application/subscriber.js';

@Module({
  imports: [/* ... */], // never SharedModule: it is @Global()
  providers: [
    MigrateGuestOrdersOnGuestProgressMigrated,
    {
      provide: SUBSCRIBERS,
      useFactory: (
        onGuestMigrated: MigrateGuestOrdersOnGuestProgressMigrated,
      ): Subscriber[] => [onGuestMigrated],
      inject: [MigrateGuestOrdersOnGuestProgressMigrated],
    },
    SubscribersBootstrapper,
    // ...
  ],
})
export class SalesModule {}
```

> **Important:** SUBSCRIBERS uses a `useFactory` that returns an array, **never** `useExisting + multi: true`.

## External Documentation

- [NestJS — Lifecycle Events](https://docs.nestjs.com/fundamentals/lifecycle-events) — the `OnModuleInit` that `SubscribersBootstrapper` uses
