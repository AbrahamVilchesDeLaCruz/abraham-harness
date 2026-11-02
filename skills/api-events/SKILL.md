---
name: api-events
description: "Trigger: When defining the DomainEventPublisher, creating a concrete Subscriber in application, or understanding the domain event flow. DomainEventPublisher interface, DomainEventConsumer, abstract Subscriber in apps/api/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## Activation Contract

- When defining the `DomainEventPublisher` interface or the `DomainEventConsumer` interface
- When creating a concrete `Subscriber` in application
- When understanding the event flow and the dependency rule

## Hard Rules

- Abstract `Subscriber` — **zero framework imports**
- The framework's injection decorators on the concrete subscriber are the only allowed exception
- The startup hook lives in infrastructure (`SubscribersBootstrapper`) — never in application
- `on()` **always delegates to a use case** — no business logic of its own
- The subscriber lives **next to the use case it triggers** — never in a separate `subscribers/` folder
- `domainEventPublisher.publish()` is called **after** `repository.save()` — never before
- For the infrastructure implementation, see skill `api-events-infra`

## Decision Gates

### Layers and responsibilities

```
Domain         → DomainEvent, DomainEventPublisher interface
Application    → Subscriber (abstract), DomainEventConsumer interface
Infrastructure → message bus adapter, SubscribersBootstrapper, framework modules
```

### Queue Naming

```
<bounded-context>.<action>_on_<past_event>

progress.update_product_stats_on_payment_recorded
content.generate_product_audio_on_product_examples_completed
identity.send_welcome_email_on_user_registered
```

The `.retry` and `.dead_letter` queues are created automatically — see `api-events-infra`.

## Execution Steps

Full flow:

```
UseCase
  → domainEventPublisher.publish(aggregate.pullDomainEvents())
    → message bus adapter publish() → broker
      → subscriber's queue
        → SubscribersBootstrapper at startup → subscriber.init()
          → message bus adapter consume() → automatic queue setup
            → subscriber.on(event) → corresponding UseCase
```

## References

- [`references/subscriber-pattern.md`](references/subscriber-pattern.md) — complete abstract `Subscriber` class, a concrete subscriber example, `SubscribersBootstrapper`, and the `DomainEventPublisher` and `DomainEventConsumer` interfaces.
- [`references/docs.md`](references/docs.md) — related skills, ADRs and documentation.
- Load the project's stack skill for the HTTP framework (`stack-nestjs`) and read its `references/api-events.md` for decorators, the bootstrapper and module registration.
- Load the project's stack skill for messaging (`stack-rabbitmq`) and read its `references/api-events.md` for the broker flow.
