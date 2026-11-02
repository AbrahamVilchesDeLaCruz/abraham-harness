---
name: api-events
description: "Trigger: Al definir el DomainEventPublisher, crear un Subscriber concreto en application, o entender el flujo de domain events. DomainEventPublisher interface, DomainEventConsumer, Subscriber abstract en apps/api/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## Activation Contract

- Al definir el `DomainEventPublisher` interface o `DomainEventConsumer` interface
- Al crear un `Subscriber` concreto en application
- Al entender el flujo de eventos y la regla de dependencia

## Hard Rules

- `Subscriber` abstract — **cero imports de `@nestjs/common`**
- `@Inject` + `@Injectable` en el subscriber concreto son la única excepción permitida
- `OnModuleInit` vive en infrastructure (`SubscribersBootstrapper`) — nunca en application
- `on()` **siempre delega a un UseCase** — sin lógica de negocio propia
- El subscriber vive **junto al use case que dispara** — nunca en carpeta `subscribers/` independiente
- `domainEventPublisher.publish()` se llama **después** de `repository.save()` — nunca antes
- Ver implementación de infrastructure: skill `api-events-infra`

## Decision Gates

### Capas y responsabilidades

```
Domain         → DomainEvent, DomainEventPublisher interface
Application    → Subscriber (abstract), DomainEventConsumer interface
Infrastructure → AmqpMessageBus, SubscribersBootstrapper, módulos NestJS
```

### Queue Naming

```
<bounded-context>.<acción>_on_<evento_pasado>

progress.update_product_stats_on_payment_recorded
content.generate_product_audio_on_product_examples_completed
identity.send_welcome_email_on_user_registered
```

Las colas `.retry` y `.dead_letter` se crean automáticamente — ver `api-events-infra`.

## Execution Steps

Flujo completo:

```
UseCase
  → domainEventPublisher.publish(aggregate.pullDomainEvents())
    → AmqpMessageBus.publish() → RabbitMQ exchange
      → cola del subscriber
        → SubscribersBootstrapper.onModuleInit() → subscriber.init()
          → AmqpMessageBus.consume() → setupQueues() automático
            → subscriber.on(event) → UseCase correspondiente
```

## References

- [`references/subscriber-pattern.md`](references/subscriber-pattern.md) — clase `Subscriber` abstract completa, un ejemplo de subscriber concreto, `SubscribersBootstrapper`, registro en módulos NestJS e interfaces `DomainEventPublisher` y `DomainEventConsumer`.
- [`references/docs.md`](references/docs.md) — skills relacionadas, ADRs y documentación externa.
