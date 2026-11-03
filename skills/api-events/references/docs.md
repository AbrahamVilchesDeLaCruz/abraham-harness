# api-events — Docs & References

## Related Skills

| Skill | Why read it |
|---|---|
| `api-domain-events` | How the `DomainEvent`s that subscribers consume are defined |
| `api-events-infra` | The message bus adapter — implementation of `DomainEventPublisher` and `DomainEventConsumer` |
| `api-application` | Use cases — where `domainEventPublisher.publish()` is called |
| `api-di` | How to register `DOMAIN_EVENT_PUBLISHER` and `DOMAIN_EVENT_CONSUMER` in modules |

## Why not an in-process event emitter?

An in-process emitter loses events if the process dies. A durable broker allows retry, DLQ and distribution across multiple instances. For a production system, the async bus is the right choice.

## Internal Docs

| Doc | Relevant content |
|---|---|
| `backend-architecture.md` in `engineering-conventions` | Why `Subscriber` does not import the framework (dependency rule) |
