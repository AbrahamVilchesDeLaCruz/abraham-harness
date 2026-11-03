# Domain Events — Patterns

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

### Defining an event — canonical pattern

Name: `{Aggregate}{ActionPast}Event` — PascalCase, `Event` suffix.

```typescript
// catalog/product/domain/events/product-created.event.ts
import { DomainEvent, type DomainEventAttributes } from '@/shared/domain/domain-event.js';
import { type ProductPrimitives } from '../product.js';

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

### Recording in the aggregate

```typescript
// sales/domain/order.ts
recordPayment(productId: string, approved: boolean, productChannel: string | null): Payment {
  if (this.mode.isDraft()) {
    throw new PaymentRequiresOrderMode(this.id.value);
  }
  if (!this._status.isInProgress()) {
    throw new OrderNotInProgress(this.id.value);
  }
  if (!this.productIds.includes(productId)) {
    throw new ProductNotInOrder(productId, this.id.value);
  }

  const payment = Payment.create(this.id.value, productId, approved);
  this._payments.push(payment);

  this.record(
    new PaymentRecordedEvent(this.id.value, {
      orderId: this.id.value,
      userId: this.userId,
      productId,
      productChannel,
      approved,
      mode: this.mode.value,
      paidAt: payment.paidAt.toISOString(),
    }),
  );

  return payment;
}
```

The `attributes` contain the aggregate's fields relevant to the event — usually a subset of `toPrimitives()` or the values subscribers need.

### Explicitly typed attributes

When the event has specific attributes, extend `DomainEventAttributes`:

```typescript
// sales/domain/events/payment-recorded.event.ts
export interface PaymentRecordedAttributes extends DomainEventAttributes {
  orderId: string;
  userId: string | null;
  productId: string;
  productChannel: string | null;
  approved: boolean;
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

### File location

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
// ❌ eventName as an instance property — collides with the abstract method
export class ProductCreatedEvent extends DomainEvent {
  readonly eventName = 'myapp.catalog.product.created'; // COMPILE ERROR
  eventName(): string { ... }                                        // DUPLICATE IDENTIFIER
}

// ✅ Correct — static + instance method
export class ProductCreatedEvent extends DomainEvent {
  static readonly EVENT_NAME = 'myapp.catalog.product.created';
  eventName(): string { return ProductCreatedEvent.EVENT_NAME; }
}

// ❌ No Event suffix
export class ProductCreated extends DomainEvent {}

// ❌ eventName with camelCase or hyphens
static readonly EVENT_NAME = 'myapp.catalogProduct.created';

// ❌ Raising events outside the aggregate
// in a use case:
this.record(new ProductCreatedEvent(...)); // belongs inside the aggregate method

// ❌ fromPrimitives with parameters in a different order
static fromPrimitives(attributes, aggregateId, ...): XxxEvent {} // fixed order: aggregateId, eventId, occurredOn, attributes
```
