# api-di — Docs & References

## Related Skills

| Skill | Why read it |
|---|---|
| `api-shared` | Global shared module — how Logger, EventBus, DB are registered |
| `api-infrastructure` | Module structure of a bounded context |
| `api-application` | How use cases inject ports with the token |
| `api-events` | `EVENT_BUS` and `DOMAIN_EVENT_CONSUMER` tokens |

## Why Symbol and not string

- String — collisions between modules.
- Class — couples the use case to the concrete implementation.
- Symbol — unique, safe, no collisions:

```typescript
export const ORDER_REPOSITORY = Symbol('OrderRepository');
```

## Internal Docs

| Doc | Relevant content |
|---|---|
| `docs/engineering/backend-architecture.md` | Dependency inversion — why the use case depends on interfaces, not concrete classes |
| `docs/engineering/engineering-principles.md` | DIP (Dependency Inversion Principle) — the foundation of Symbol tokens |
