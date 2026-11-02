# api-domain-events — Docs & References

## Related Skills

| Skill | Why read it |
|---|---|
| `api-domain` | `DomainEvent` base class, `AggregateRoot.record()` and `pullDomainEvents()` |
| `api-events` | `EventBus` interface, `Subscriber` abstract — how events are consumed |
| `api-events-infra` | The message bus adapter — how events are published and consumed on the broker |
| `api-application` | When to call `eventBus.publish()` in the use case |

## External Documentation

- [Domain Events — Domain-Driven Design Reference (Evans)](https://www.domainlanguage.com/ddd/reference/) — canonical definition

## Event Naming Reference

```
Namespace:  myapp
Context:    catalog | sales | identity
Entity:     product | order | user | payment | stat
Verb:       created | updated | deleted | completed | recorded | migrated
```

Canonical project examples:
- `myapp.catalog.product.created`
- `myapp.sales.orders.order.completed`
- `myapp.sales.payments.payment.recorded`
- `myapp.identity.guest_progress.migrated`

## Internal Docs

| Doc | Relevant content |
|---|---|
| `docs/engineering/engineering-principles.md` | Why events have primitive attributes (immutability, serialization) |
