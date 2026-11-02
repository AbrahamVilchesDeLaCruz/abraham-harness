---
name: api-events-infra
description: "Trigger: Al implementar AmqpMessageBus, configurar SubscribersBootstrapper, o entender retry y DLQ. AmqpMessageBus, SubscribersBootstrapper, retry, DLQ, idempotencia en apps/api/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## Activation Contract

- Al implementar o modificar `AmqpMessageBus`
- Al registrar subscribers en módulos NestJS
- Al diseñar la política de retry o idempotencia

## Hard Rules

`AmqpMessageBus` implementa **tres interfaces** a la vez:

```
DomainEventPublisher (domain)  → publish(events)
DomainEventConsumer (app)      → consume(queue, eventName, exchange, DomainEventClass, handler)
OnModuleDestroy (NestJS)       → onModuleDestroy() — cierra channel + connection al apagar
```

- `SubscribersBootstrapper` llama a `subscriber.init()` en `onModuleInit()` — registra todos los consumers al arrancar.
- `AmqpMessageBus` vive en `shared/infrastructure/` — es transversal a todos los BC
- `AmqpMessageBus` se registra **una sola vez** en `SharedModule` como singleton vía `useExisting`; los módulos BC no lo re-registran
- `SubscribersBootstrapper` y el token `SUBSCRIBERS` se importan desde shared
- `OnModuleInit` solo en `SubscribersBootstrapper` — nunca en subscribers ni use cases
- `SUBSCRIBERS` se registra con `useFactory` que devuelve un array de subscribers — nunca `useExisting + multi: true`
- El DLQ no se re-encola automáticamente — requiere fix manual + re-encolado explícito
- `prefetch(1)` siempre — procesamiento secuencial por consumer
- `DomainEventClass` es `new (...args: unknown[]) => DomainEvent` — no `never`, no `any`
- El payload publicado usa el campo `data` para los atributos del evento, no `attributes` ni `toPrimitives()`
- `AmqpMessageBus` tiene reconexión automática: al cerrar la conexión, espera `RECONNECT_DELAY_MS` y re-registra todos los consumers

## Decision Gates

### Retry Policy

| Intento | Delay | Mecanismo |
|---|---|---|
| 1 | 1 s | `expiration: "1000"` en `.retry` → vuelve vía DLX |
| 2 | 5 s | `expiration: "5000"` en `.retry` → vuelve vía DLX |
| 3 | 10 s | `expiration: "10000"` en `.retry` → vuelve vía DLX |
| 4 | — | → `.dead_letter` — intervención manual |

**El `expiration` es por mensaje, no por cola** — permite backoff exponencial con una sola `.retry` queue.

Colas creadas automáticamente en `setupQueues()`:
- `{queueName}` — cola principal
- `{queueName}.retry` — mensajes esperando reintento
- `{queueName}.dead_letter` — mensajes agotados

### Idempotencia

| Caso | Opción |
|---|---|
| Por defecto | Opción A — Natural |
| Operaciones irreversibles críticas | Opción B — Inbox table |

Tabla: `processed_events(event_id UUID PK, event_name, processed_at)` — purgar > 30 días.

## References

- [`references/amqp-message-bus.md`](references/amqp-message-bus.md) — implementación completa de `AmqpMessageBus`, `SubscribersBootstrapper`, registro en módulos, recuperación de DLQ y ejemplos de las opciones de idempotencia.
- [`references/docs.md`](references/docs.md) — skills relacionadas, ADRs y documentación externa.
