# api-di with NestJS

The concept skill `api-di` defines the rules. This reference shows how to apply them with NestJS.

## Rules

- The domain and the application **must not know NestJS exists**. To achieve this, each interface has its own injection token that imports nothing from `@nestjs/common`.
- Tokens are `Symbol` — **always** — not strings (collisions), not NestJS classes (coupling).
- The parameter type is the **interface** — never the concrete implementation. `@Inject(TOKEN)` is the only trace of NestJS in application/domain.
- Modules are the only ones that know the concrete implementations (TypeORM, RabbitMQ, etc.).
- Inject with `@Inject(TOKEN)`, typing the parameter with the interface.
- The concrete class (`TypeOrm*`, `Amqp*`) is registered only in the infrastructure module.
- The use case injects by token: `@Inject({ENTITY}_REPOSITORY)`.
- No `forwardRef()` if there is no real circular dependency.

## Concept flow

```
Interface (domain)       → defines the contract
Token (domain/shared)    → Symbol — the DI identifier
Implementation (infra)   → concrete class that implements the interface
Registration (module)    → NestJS binds token → implementation
Injection (use case)     → @Inject(TOKEN) — the only contact point
```

## Provider choice

| Situation | Provider |
| --- | --- |
| Most common case (repositories, services) | `useClass` |
| Singleton shared under multiple tokens | `useExisting` |
| Providers that depend on multiple instances | `useFactory` |

## Registration in Module

### `useClass` — most common case (repositories, services)

```typescript
// src/sales/infrastructure/framework/sales.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ORDER_REPOSITORY } from '@/sales/domain/order.repository';
import { TypeOrmOrderRepository } from '@/sales/infrastructure/persistence/typeorm-order.repository';
import { OrderEntity } from '@/sales/infrastructure/persistence/order.entity';
import { OrderStarter } from '@/sales/application/start/order-starter';
import { StartOrderPostController } from '@/sales/infrastructure/controllers/start-order-post.controller';
import { SalesExceptionRegistry } from './sales-exception-registry';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity])],
  controllers: [StartOrderPostController],
  providers: [
    // Ports
    { provide: ORDER_REPOSITORY, useClass: TypeOrmOrderRepository },
    // Use cases
    OrderStarter,
    // The module's exception registry
    SalesExceptionRegistry,
  ],
  // Export the module's exception registry and only the tokens that other modules need
  exports: [SalesExceptionRegistry],
})
export class SalesModule {}
```

### `useExisting` — singleton shared under multiple tokens

```typescript
// src/shared/infrastructure/framework/shared.module.ts
@Global()
@Module({
  imports: [/* only the shared modules of the bounded contexts */],
  providers: [
    AmqpMessageBus,
    // One singleton, two distinct contracts
    { provide: DOMAIN_EVENT_PUBLISHER, useExisting: AmqpMessageBus },
    { provide: DOMAIN_EVENT_CONSUMER, useExisting: AmqpMessageBus },
    { provide: LOGGER_SERVICE, useClass: PinoLogger },
  ],
  exports: [LOGGER_SERVICE, DOMAIN_EVENT_PUBLISHER, DOMAIN_EVENT_CONSUMER],
})
export class SharedModule {}
```

### `useFactory` — providers that depend on multiple instances

```typescript
// Register a list of typed subscribers
{
  provide: SUBSCRIBERS,
  useFactory: (
    onOrderCompleted: LoyaltyUpdaterOnOrderCompleted,
  ): Subscriber[] => [onOrderCompleted],
  inject: [LoyaltyUpdaterOnOrderCompleted],
},
SubscribersBootstrapper,
```

## Injection in Use Case

```typescript
// src/sales/application/complete/order-completer.ts
import { Inject, Injectable } from '@nestjs/common';
import {
  type OrderRepository,
  ORDER_REPOSITORY,
} from '@/sales/domain/order.repository';
import {
  type DomainEventPublisher,
  DOMAIN_EVENT_PUBLISHER,
} from '@/shared/domain/domain-event-publisher';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';
import { type AppMetrics, APP_METRICS } from '@/shared/domain/app-metrics';

@Injectable()
export class OrderCompleter {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly repository: OrderRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly publisher: DomainEventPublisher,
    @Inject(LOGGER_SERVICE) private readonly logger: Logger,
    @Inject(APP_METRICS) private readonly metrics: AppMetrics,
  ) {}
}
```

## Why Symbol and not string

```typescript
// ❌ String — collisions between modules
{ provide: 'Repository', useClass: TypeOrmOrderRepository }
// ❌ Class — couples the use case to the concrete implementation
{ provide: TypeOrmOrderRepository, useClass: TypeOrmOrderRepository }

// ✅ Symbol — unique, safe, no collisions
export const ORDER_REPOSITORY = Symbol('OrderRepository');
{ provide: ORDER_REPOSITORY, useClass: TypeOrmOrderRepository }
```

## Module template

File: `{context}/infrastructure/framework/{context}.module.ts` (registration)

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { {Entity}Entity } from '../persistence/{entity}.entity';
import { TypeOrm{Entity}Repository } from '../persistence/typeorm-{entity}.repository';
import { {ENTITY}_REPOSITORY } from '../../domain/{entity}.repository';
import { {Entity}{Verb}er } from '../../application/{verb}/{entity}-{verb}er';
import { {Verb}{Entity}PostController } from '../controllers/{verb}-{entity}-post.controller';
import { {Entity}ExceptionRegistry } from './{entity}-exception-registry';

@Module({
  imports: [TypeOrmModule.forFeature([{Entity}Entity])],
  controllers: [{Verb}{Entity}PostController],
  providers: [
    // Ports
    {
      provide: {ENTITY}_REPOSITORY,
      useClass: TypeOrm{Entity}Repository,
    },
    // Use cases
    {Entity}{Verb}er,
    // The module's exception registry
    {Entity}ExceptionRegistry,
  ],
  // Export the module's exception registry and only the tokens that other modules need
  exports: [{Entity}ExceptionRegistry],
})
export class {Entity}Module {}
```

## Naming convention for tokens

```
{ENTITY}_REPOSITORY        → ORDER_REPOSITORY, USER_REPOSITORY
{ENTITY}_QUERY             → ORDER_STATS_QUERY, USER_STATS_QUERY (read-only projections)
{ENTITY}_SELECTOR          → PRODUCT_SELECTOR (domain selectors)
{ENTITY}_PROVIDER          → BESTSELLER_PRODUCT_IDS_PROVIDER (domain providers)
{ENTITY}_SERVICE           → EMAIL_SERVICE (external services)
DOMAIN_EVENT_PUBLISHER     → shared — publishes DomainEvent[]
DOMAIN_EVENT_CONSUMER      → shared — consumes AMQP queues
LOGGER_SERVICE             → shared — interface Logger
APP_METRICS                → shared — interface AppMetrics
```

## External Documentation

- [NestJS — Custom Providers](https://docs.nestjs.com/fundamentals/custom-providers) — `useClass`, `useFactory`, `useValue`, `useExisting`
- [NestJS — Injection Scopes](https://docs.nestjs.com/fundamentals/injection-scopes) — DEFAULT (singleton), REQUEST, TRANSIENT
- [NestJS — Circular Dependency](https://docs.nestjs.com/fundamentals/circular-dependency) — `forwardRef()` and how to avoid needing it
