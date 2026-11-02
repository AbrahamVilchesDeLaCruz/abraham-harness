---
name: api-domain-events
description: "Convenciones de Domain Events en la API: definición, naming, atributos y registro en aggregates. Trigger: Al crear o modificar domain events, o al registrar eventos en un aggregate en apps/api/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## When to Use

- Al crear un nuevo domain event
- Al registrar un evento en un aggregate con `record()`
- Al definir el `EVENT_NAME` (key) de un evento
- Al implementar `fromPrimitives()` en un event para reconstrucción desde el bus

> Usa el template de `assets/domain-event.template.md` al crear un nuevo domain event.
> Lee `references/docs.md` para naming conventions, ADRs y skills relacionadas.

## Critical Patterns

### DomainEvent base class

```typescript
// shared/domain/domain-event.ts
export abstract class DomainEvent {
  readonly eventId: string;
  readonly occurredOn: Date;

  constructor(
    readonly aggregateId: string,
    readonly attributes: DomainEventAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    this.eventId = eventId ?? crypto.randomUUID();
    this.occurredOn = occurredOn ?? new Date();
  }

  abstract eventName(): string;
}
```

### Definición de un evento — patrón canónico

Nombre: `{Aggregate}{ActionPast}Event` — PascalCase, sufijo `Event`.

```typescript
// catalog/product/domain/events/product-created.event.ts
import { DomainEvent, type DomainEventAttributes } from '@/shared/domain/domain-event';
import { type ProductPrimitives } from '../product';

export class ProductCreatedEvent extends DomainEvent {
  static readonly EVENT_NAME = 'myapp.catalog.product.created';

  constructor(
    aggregateId: string,
    attributes: ProductPrimitives,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attributes, eventId, occurredOn);
  }

  eventName(): string {
    return ProductCreatedEvent.EVENT_NAME;
  }

  static fromPrimitives(
    aggregateId: string,
    eventId: string,
    occurredOn: Date,
    attributes: DomainEventAttributes,
  ): ProductCreatedEvent {
    return new ProductCreatedEvent(
      aggregateId,
      attributes as ProductPrimitives,
      eventId,
      occurredOn,
    );
  }
}
```

**Reglas:**

- `EVENT_NAME` es `static readonly` — nunca un campo de instancia
- `eventName()` es un método de instancia que devuelve la constante estática
- `attributes` tipado con el tipo específico del aggregate (ej: `ProductPrimitives`)
- `fromPrimitives()` es estático — firma fija: `(aggregateId, eventId, occurredOn, attributes)`
- `eventId` y `occurredOn` son opcionales en el constructor — el base class asigna defaults

### Naming del EVENT_NAME

Formato: `<project>.<bounded_context>.<module?>.<aggregate>.<action_past>`

```
myapp.catalog.product.created
myapp.sales.payments.payment.recorded
myapp.sales.orders.order.completed
myapp.achievement.catalog.achievement.unlocked   ← con módulo intermedio
```

**Reglas:**

- Todo en `snake_case` — sin mayúsculas, sin guiones
- El bounded context es el nombre de la carpeta raíz del BC
- El módulo es opcional — solo cuando hay submódulo explícito dentro del BC
- La acción en participio pasado en inglés: `created`, `updated`, `removed`, `recorded`, `completed`

### Registro en el aggregate

```typescript
// sales/domain/order.ts
recordPayment(productId: string, correct: boolean, productModule: string | null): Payment {
  if (this.mode.isStudy()) {
    throw new PaymentRequiresOrderMode(this.id.value);
  }
  if (!this._status.isInProgress()) {
    throw new OrderNotInProgress(this.id.value);
  }
  if (!this.productIds.includes(productId)) {
    throw new ProductNotInOrder(productId, this.id.value);
  }

  const payment = Payment.create(this.id.value, productId, correct);
  this._payments.push(payment);

  this.record(
    new PaymentRecordedEvent(this.id.value, {
      orderId: this.id.value,
      userId: this.userId,
      productId,
      productModule,
      correct,
      mode: this.mode.value,
      paidAt: payment.paidAt.toISOString(),
    }),
  );

  return payment;
}
```

Los `attributes` contienen los campos relevantes del aggregate para el evento — habitualmente un subconjunto de `toPrimitives()` o los valores necesarios para los subscribers.

### Attributes tipado explícito

Cuando el evento tiene atributos específicos, extender `DomainEventAttributes`:

```typescript
// sales/domain/events/payment-recorded.event.ts
export interface PaymentRecordedAttributes extends DomainEventAttributes {
  orderId: string;
  userId: string | null;
  productId: string;
  productModule: string | null;
  correct: boolean;
  mode: string;
  paidAt: string;
}

export class PaymentRecordedEvent extends DomainEvent {
  static readonly EVENT_NAME = 'myapp.sales.payments.payment.recorded';

  constructor(
    aggregateId: string,
    readonly attrs: PaymentRecordedAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attrs, eventId, occurredOn);
  }

  eventName(): string {
    return PaymentRecordedEvent.EVENT_NAME;
  }
}
```

### Ubicación de archivos

```
{bc}/{module}/domain/
├── order.ts
└── events/
    ├── payment-recorded.event.ts
    ├── order-completed.event.ts
    ├── order-paused.event.ts
    └── order-abandoned.event.ts
```

## Anti-patterns

```typescript
// ❌ eventName como propiedad de instancia — colisiona con el método abstracto
export class ProductCreatedEvent extends DomainEvent {
  readonly eventName = 'myapp.catalog.product.created'; // COMPILE ERROR
  eventName(): string { ... }                                        // DUPLICATE IDENTIFIER
}

// ✅ Correcto — static + método de instancia
export class ProductCreatedEvent extends DomainEvent {
  static readonly EVENT_NAME = 'myapp.catalog.product.created';
  eventName(): string { return ProductCreatedEvent.EVENT_NAME; }
}

// ❌ Sin sufijo Event
export class ProductCreated extends DomainEvent {}

// ❌ eventName con camelCase o guiones
static readonly EVENT_NAME = 'myapp.catalogProduct.created';

// ❌ Disparar eventos fuera del aggregate
// en use case:
this.record(new ProductCreatedEvent(...)); // va dentro del aggregate method

// ❌ fromPrimitives con parámetros en orden distinto
static fromPrimitives(attributes, aggregateId, ...): XxxEvent {} // orden fijo: aggregateId, eventId, occurredOn, attributes
```
