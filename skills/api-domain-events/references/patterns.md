# Domain Events — Patrones

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

### Registro en el aggregate

```typescript
// sales/domain/order.ts
recordPayment(productId: string, correct: boolean, productModule: string | null): Payment {
  if (this.mode.isDraft()) {
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
