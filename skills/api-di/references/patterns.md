# DI: patterns and examples

## Concept

The domain and the application **must not know the framework exists**. To achieve this, each interface has its own injection token that imports nothing from the framework.

```
Interface (domain)       → defines the contract
Token (domain/shared)    → Symbol — the DI identifier
Implementation (infra)   → concrete class that implements the interface
Registration (module)    → the framework connects token → implementation
Injection (use case)     → injection marker with the token — the only point of contact with the framework
```

## Token Definition

Tokens are `Symbol` — not strings (collisions), not framework classes (coupling).

```typescript
// src/sales/domain/order.repository.ts
import { type Criteria } from '@/shared/domain/criteria';
import { type Order } from './order';
import { type OrderId } from './order-id';

export interface OrderRepository {
  save(order: Order): Promise<void>;
  search(id: OrderId): Promise<Order | null>;
  match(criteria: Criteria): Promise<Order[]>;
}

// The token lives next to the interface — in domain
export const ORDER_REPOSITORY = Symbol('OrderRepository');
```

The pattern repeats for any abstraction:

```typescript
// src/shared/domain/domain-event-publisher.ts
export interface DomainEventPublisher {
  publish(events: DomainEvent[]): Promise<void>;
}
export const DOMAIN_EVENT_PUBLISHER = Symbol('DomainEventPublisher');

// src/shared/application/domain-event-consumer.ts
export interface DomainEventConsumer { ... }
export const DOMAIN_EVENT_CONSUMER = Symbol('DomainEventConsumer');

// src/shared/domain/logger.ts
export interface Logger { ... }
export const LOGGER_SERVICE = Symbol('Logger');

// src/shared/domain/app-metrics.ts
export interface AppMetrics { ... }
export const APP_METRICS = Symbol('AppMetrics');
```

## Registration in Module

The infrastructure module connects each token to its implementation. Registration code lives in the project's stack skill.

- Bind to a class — most common case (repositories, services).
- Alias to an existing singleton — singleton shared under multiple tokens: one singleton, two distinct contracts.
- Bind to a factory — providers that depend on multiple instances, such as a list of typed subscribers.
- Export only the tokens that other modules need. A submodule also exports its exception registry.
- A bounded context's shared module imports its submodules. The root shared module imports only those shared modules.

## Injection in Use Case

```typescript
// src/sales/application/complete/order-completer.ts
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

export class OrderCompleter {
  constructor(
    private readonly repository: OrderRepository,
    private readonly publisher: DomainEventPublisher,
    private readonly logger: Logger,
    private readonly metrics: AppMetrics,
  ) {}
}
```
