---
name: api-domain-events
description: "Trigger: When creating or modifying domain events, or when recording events in an aggregate in apps/api/. Domain Events conventions in the API: definition, naming, attributes and recording in aggregates."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## Activation Contract

- When creating a new domain event
- When recording an event in an aggregate with `record()`
- When defining an event's `EVENT_NAME` (key)
- When implementing `fromPrimitives()` on an event for reconstruction from the bus

## Hard Rules

Class — name: `{Aggregate}{ActionPast}Event` — PascalCase, `Event` suffix.

- `EVENT_NAME` is `static readonly` — never an instance field
- `eventName()` is an instance method that returns the static constant
- `attributes` is typed with the aggregate's specific type (e.g. `ProductPrimitives`)
- Event payloads use camelCase; queue names use snake_case.
- `fromPrimitives()` is static — fixed signature: `(aggregateId, eventId, occurredOn, attributes)`
- `eventId` and `occurredOn` are optional in the constructor — the base class assigns defaults
- Raise events only inside the aggregate method, never outside the aggregate (use case)

`EVENT_NAME` — format: `<project>.<bounded_context>.<module?>.<aggregate>.<action_past>`

```
myapp.catalog.product.created
myapp.sales.payments.payment.recorded
myapp.sales.orders.order.completed
myapp.achievement.catalog.achievement.unlocked   ← with an intermediate module
```

- Everything in `snake_case` — no uppercase, no hyphens
- The bounded context is the name of the BC's root folder
- The module is optional — only when there is an explicit submodule inside the BC
- The action is the English past participle: `created`, `updated`, `removed`, `recorded`, `completed`

## Decision Gates

| Situation | Action |
|---|---|
| New domain event | Use the template in `assets/domain-event.template.md` |
| The event has specific attributes | Extend `DomainEventAttributes` |

## Execution Steps

1. Define the event with the canonical pattern in `references/patterns.md`.
2. Record the event in the aggregate with `record()`. The `attributes` contain the aggregate's fields relevant to the event — usually a subset of `toPrimitives()` or the values subscribers need.
3. Place the file according to the file location section of `references/patterns.md`.
4. Review the anti-patterns in `references/patterns.md`.

## References

- [`references/patterns.md`](references/patterns.md) — `DomainEvent` base class, canonical pattern, recording in the aggregate, typed attributes, file location and anti-patterns.
- [`assets/domain-event.template.md`](assets/domain-event.template.md) — template for a new domain event.
- [`references/docs.md`](references/docs.md) — naming conventions, ADRs and related skills.
- For how events travel on the bus, load the project's stack skill for messaging (`stack-rabbitmq`) and read its `references/api-domain-events.md`. For the framework's in-process alternative, see `references/api-domain-events.md` in the HTTP framework stack skill (`stack-nestjs`).
