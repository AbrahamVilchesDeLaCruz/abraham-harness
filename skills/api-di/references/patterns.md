# DI: patrones y ejemplos

## Concept

El dominio y la aplicación **no deben saber que NestJS existe**. Para lograrlo, cada interfaz tiene un token de inyección propio que no importa nada de `@nestjs/common`.

```
Interface (domain)       → define el contrato
Token (domain/shared)    → Symbol — el identificador de DI
Implementation (infra)   → clase concreta que implementa la interface
Registration (module)    → NestJS conecta token → implementación
Injection (use case)     → @Inject(TOKEN) — único punto de contacto con NestJS
```

## Token Definition

Los tokens son `Symbol` — no strings (colisiones), no clases de NestJS (acoplamiento).

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

// El token vive junto a la interface — en domain
export const ORDER_REPOSITORY = Symbol('OrderRepository');
```

El patrón se replica para cualquier abstracción:

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

### `useClass` — caso más común (repositorios, servicios)

```typescript
// src/sales/infrastructure/framework/sales.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ORDER_REPOSITORY } from '@/sales/domain/order.repository';
import { TypeOrmOrderRepository } from '@/sales/infrastructure/persistence/typeorm-order.repository';
import { OrderEntity } from '@/sales/infrastructure/persistence/order.entity';
import { OrderStarter } from '@/sales/application/start/order-starter';
import { StartOrderPostController } from '@/sales/infrastructure/controllers/start-order-post.controller';
import { SharedModule } from '@/shared/infrastructure/framework/shared.module';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([OrderEntity])],
  controllers: [StartOrderPostController],
  providers: [
    // Ports
    { provide: ORDER_REPOSITORY, useClass: TypeOrmOrderRepository },
    // Use cases
    OrderStarter,
  ],
  // Solo exportar tokens que otros módulos necesitan
  exports: [],
})
export class SalesModule {}
```

### `useExisting` — singleton compartido bajo múltiples tokens

```typescript
// src/shared/infrastructure/framework/shared.module.ts
@Global()
@Module({
  providers: [
    AmqpMessageBus,
    // Un singleton, dos contratos distintos
    { provide: DOMAIN_EVENT_PUBLISHER, useExisting: AmqpMessageBus },
    { provide: DOMAIN_EVENT_CONSUMER, useExisting: AmqpMessageBus },
    { provide: LOGGER_SERVICE, useClass: PinoLogger },
  ],
  exports: [LOGGER_SERVICE, DOMAIN_EVENT_PUBLISHER, DOMAIN_EVENT_CONSUMER],
})
export class SharedModule {}
```

### `useFactory` — providers que dependen de múltiples instancias

```typescript
// Registrar una lista de subscribers tipados
{
  provide: SUBSCRIBERS,
  useFactory: (
    onOrderCompleted: StreakUpdaterOnOrderCompleted,
  ): Subscriber[] => [onOrderCompleted],
  inject: [StreakUpdaterOnOrderCompleted],
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
