# Domain Event Template

Copy this template when creating a new domain event. Replace all `{Placeholders}`.

## File: `{context}/domain/events/{entity}-{past-verb}.event.ts`

```typescript
import { DomainEvent, type DomainEventAttributes } from '@/shared/domain/domain-event.js';

// 1. Define the attributes type (primitives only — no domain objects)
export type {Entity}{PastVerb}Attributes = {
  id: string;
  // Add primitive fields from the aggregate
};

export class {Entity}{PastVerb}Event extends DomainEvent {
  // 2. Static constant following: {namespace}.{context}.{module?}.{entity}.{past-verb}
  static readonly EVENT_NAME = 'myapp.{context}.{entity}.{past-verb}';

  constructor(
    aggregateId: string,
    attributes: {Entity}{PastVerb}Attributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attributes, eventId, occurredOn);
  }

  // 3. Instance method — returns the static constant
  eventName(): string {
    return {Entity}{PastVerb}Event.EVENT_NAME;
  }

  // 4. fromPrimitives — required for deserialization (message bus consumer)
  static fromPrimitives(
    aggregateId: string,
    eventId: string,
    occurredOn: Date,
    attributes: DomainEventAttributes,
  ): {Entity}{PastVerb}Event {
    return new {Entity}{PastVerb}Event(
      aggregateId,
      attributes as {Entity}{PastVerb}Attributes,
      eventId,
      occurredOn,
    );
  }
}
```

## Registering in the Aggregate

```typescript
// In {Entity}.{pastVerb}() method or {Entity}.create() factory:
this.record(
  new {Entity}{PastVerb}Event(
    this.id.value,
    {
      id: this.id.value,
      // other primitive fields
    },
  ),
);
```

## Naming Convention

```
Event class:  {Entity}{PastVerb}Event
              ProductCreatedEvent
              OrderCompletedEvent
              PaymentRecordedEvent

EVENT_NAME:   myapp.{context}.{module}.{entity}.{past-verb}  ← module is optional
              myapp.catalog.product.created
              myapp.sales.orders.order.completed
              myapp.sales.payments.payment.recorded

File:         {entity}-{past-verb}.event.ts
              product-created.event.ts
              order-completed.event.ts
```

## Checklist

- [ ] `static readonly EVENT_NAME` — uppercase, on the class
- [ ] `eventName()` — instance method that returns `EVENT_NAME`
- [ ] Constructor accepts optional `eventId?` and `occurredOn?` (for replay)
- [ ] `fromPrimitives()` static — required by the message bus consumer
- [ ] Attributes are **primitives only** — no Value Objects or domain classes
- [ ] Correct namespace: `myapp.{context}.{module?}.{entity}.{past-verb}`
- [ ] The event is recorded in the aggregate with `this.record()` — never outside
