---
name: api-domain
description: "Trigger: When creating or modifying aggregates, value objects, repository interfaces or domain errors in apps/api/. Domain layer conventions in the API: AggregateRoot, Value Objects, Repository interface and Domain Errors."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---


## Activation Contract

- When creating a new aggregate root
- When creating or modifying a value object
- When defining a repository interface
- When creating a domain error

## Hard Rules

### Aggregate Root

- Extends `AggregateRoot<Primitives>` — typed with its primitives to force `fromPrimitives` and `toPrimitives`.
- No framework or persistence-library decorators
- Two static factories: `create()` for new entities (records events), `fromPrimitives()` for reconstitution from persistence (no events)
- `Primitives` contains scalar types: `string`, `number`, `boolean`, `Date`, `null` — arrays and nested primitive objects are allowed for child entities
- Mutable state (fields that change after creation) → `private _field` with a public getter
- Immutable state (does not change after creation) → `public readonly field` directly in the constructor
- Business logic goes here — never in use cases

### Value Objects

- Hierarchy for IDs: `ValueObject<string>` → `StringValueObject` → `UuidValueObject` → `XxxId`.
- Hierarchy for text fields: `ValueObject<string>` → `StringValueObject` → concrete.
- No `VO` or `ValueObject` suffix in the file name or class name
- Aggregate IDs extend `UuidValueObject` (not `StringValueObject` directly) — UUID validation before `super()`
- IDs shared between BCs go in `shared/domain/`; value objects owned by the BC go in its `domain/`
- Validation in the constructor — throws `DomainException` if invalid
- `equals()` is inherited — do not reimplement it

### Repository Interface

- The base contract includes `match`, `search`, `save`, `remove`. Each aggregate may add further methods as needed (e.g. `count`, `saveAll`). The DI Symbol is also exported next to the interface.

### Domain Errors

- The base class is `DomainException`, located in `shared/domain/exceptions/domain-exception.ts`.
- Name: `{Entity}{Problem}` — no `Error` or `Exception` suffix
- Extend `DomainException` — never `Error` directly
- Location: `{bc}/domain/exceptions/` (subfolder, not in the root of `domain/`)
- They only describe WHAT happened — the controller decides the HTTP status

## Decision Gates

| Method | Semantics |
| --- | --- |
| `match(criteria)` | Search with filters, order, pagination |
| `count(criteria)` | Counts without fetching entities |
| `search(id)` | By id — returns `null` if it does not exist |
| `save(aggregate)` | Creates or updates (upsert) |
| `saveAll(list)` | Batch upsert (when applicable) |
| `remove(id)` | Deletes by id |

## Execution Steps

1. Start from the aggregate or value object template when applicable.
2. Apply the Hard Rules of the piece you are creating or modifying.
3. Check against the anti-patterns in `references/patterns.md`.

## Output Contract

Deliver the aggregate, value object, repository interface or domain error in the location the Hard Rules indicate.

## References

- [`references/patterns.md`](references/patterns.md): code for aggregate root, value objects, repository, domain errors and anti-patterns.
- Use the templates in [`assets/aggregate-root.template.md`](assets/aggregate-root.template.md) and [`assets/value-object.template.md`](assets/value-object.template.md).
- Read [`references/docs.md`](references/docs.md) for invariants vs. domain errors and DDD references.
- The domain carries no framework code. The project's stack skills (`stack-nestjs` and the persistence `stack-*`) repeat this boundary in `references/api-domain.md`.
