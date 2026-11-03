---
name: api-events-infra
description: "Trigger: When implementing the message bus adapter, configuring SubscribersBootstrapper, or understanding retry and dead letters. Message bus adapter, SubscribersBootstrapper, retry, dead letters, idempotency in apps/api/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## Activation Contract

- When implementing or modifying the message bus adapter
- When registering subscribers in modules
- When designing the retry or idempotency policy

## Hard Rules

The message bus adapter implements **three contracts** at once:

```
DomainEventPublisher (domain)  → publish(events)
DomainEventConsumer (app)      → consume(queue, eventName, exchange, DomainEventClass, handler)
Framework shutdown hook        → closes channel + connection on shutdown
```

- `SubscribersBootstrapper` calls `subscriber.init()` from the framework's startup hook — it registers all consumers at startup.
- The message bus adapter lives in `shared/infrastructure/` — it cuts across all BCs
- The message bus adapter is registered **only once** in the shared module as a singleton; BC modules do not re-register it
- `SubscribersBootstrapper` and the `SUBSCRIBERS` token are imported from shared
- The startup hook goes only in `SubscribersBootstrapper` — never in subscribers or use cases
- `SUBSCRIBERS` is registered with a factory that returns an array of subscribers — never with an alias multi-provider
- The dead-letter queue is not re-enqueued automatically — it requires a manual fix + explicit re-enqueue
- Fetch one message at a time, always — sequential processing per consumer
- `DomainEventClass` is `new (...args: unknown[]) => DomainEvent` — not `never`, not `any`
- The published payload uses the `data` field for the event attributes, not `attributes` or `toPrimitives()`
- Event payloads use camelCase; queue names use snake_case.
- The message bus adapter reconnects automatically: when the connection closes, it waits `RECONNECT_DELAY_MS` and re-registers all consumers

## Decision Gates

### Retry Policy

| Attempt | Delay | Mechanism |
|---|---|---|
| 1 | 1 s | Message expires after 1000 ms in `.retry` → returns via dead-lettering |
| 2 | 5 s | Message expires after 5000 ms in `.retry` → returns via dead-lettering |
| 3 | 10 s | Message expires after 10000 ms in `.retry` → returns via dead-lettering |
| 4 | — | → `.dead_letter` — manual intervention |

**The expiration is per message, not per queue** — it allows exponential backoff with a single `.retry` queue.

Queues created automatically during queue setup:
- `{queueName}` — main queue
- `{queueName}.retry` — messages waiting for a retry
- `{queueName}.dead_letter` — exhausted messages

### Idempotency

| Case | Option |
|---|---|
| Default | Option A — Natural |
| Critical irreversible operations | Option B — Inbox table |

Table: `processed_events(event_id UUID PK, event_name, processed_at)` — purge > 30 days.

## References

- [`references/message-bus.md`](references/message-bus.md) — what the adapter must do, retry flow, dead-letter recovery and idempotency option examples.
- [`references/docs.md`](references/docs.md) — related skills, ADRs and documentation.
- Load the project's stack skill for messaging (`stack-rabbitmq`) and read its `references/api-events-infra.md` for the full adapter.
- Load the project's stack skill for the HTTP framework (`stack-nestjs`) and read its `references/api-events-infra.md` for the bootstrapper and module registration.
