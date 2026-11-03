# api-domain — Docs & References

## Related Skills

| Skill | Why read it |
|---|---|
| `api-domain-events` | How to define and record Domain Events in aggregates |
| `api-application` | Use Cases — they consume aggregates and Value Objects |
| `api-infrastructure` | Persistence entity vs. Aggregate — how to keep persistence separate |
| `api-testing` | Object Mothers for aggregates and Value Objects |

## External Documentation

- [Domain-Driven Design Reference (Evans)](https://www.domainlanguage.com/ddd/reference/) — Aggregate, Value Object, Entity, Domain Event
- [Implementing DDD — Vaughn Vernon](https://vaughnvernon.com/?page_id=168) — tactical patterns with TypeScript
- [TypeScript — readonly](https://www.typescriptlang.org/docs/handbook/2/objects.html#readonly-properties) — immutability in Value Objects

## Available templates

- `assets/aggregate-root.template.md` — AggregateRoot template
- `assets/value-object.template.md` — Value Object template

## Invariants vs. Domain Errors

Invariants are validated in the Value Object constructor or in the Aggregate method that modifies state. The Domain Error is thrown from there — never from the Use Case or the Controller.

```typescript
// ✅ Invariant in the value object — throws before creating the invalid object
export class ProductName extends StringValueObject {
  constructor(value: string) {
    super(value);
    if (value.trim().length === 0) throw new ProductNameEmpty();
    if (value.length > 500) throw new ProductNameTooLong(value.length);
  }
}
```

## Internal Docs

| Doc | Relevant content |
|---|---|
| `engineering-principles.md` in `engineering-conventions` | SOLID, SRP, dependency inversion — the **why** of each domain rule |
| `backend-architecture.md` in `engineering-conventions` | Layers (Domain→Application→Infrastructure), dependency rule, what each layer can import |
