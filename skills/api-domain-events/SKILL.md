---
name: api-domain-events
description: "Trigger: Al crear o modificar domain events, o al registrar eventos en un aggregate en apps/api/. Convenciones de Domain Events en la API: definición, naming, atributos y registro en aggregates."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## Activation Contract

- Al crear un nuevo domain event
- Al registrar un evento en un aggregate con `record()`
- Al definir el `EVENT_NAME` (key) de un evento
- Al implementar `fromPrimitives()` en un event para reconstrucción desde el bus

## Hard Rules

Clase — nombre: `{Aggregate}{ActionPast}Event` — PascalCase, sufijo `Event`.

- `EVENT_NAME` es `static readonly` — nunca un campo de instancia
- `eventName()` es un método de instancia que devuelve la constante estática
- `attributes` tipado con el tipo específico del aggregate (ej: `ProductPrimitives`)
- `fromPrimitives()` es estático — firma fija: `(aggregateId, eventId, occurredOn, attributes)`
- `eventId` y `occurredOn` son opcionales en el constructor — el base class asigna defaults
- Disparar eventos solo dentro del aggregate method, nunca fuera del aggregate (use case)

`EVENT_NAME` — formato: `<project>.<bounded_context>.<module?>.<aggregate>.<action_past>`

```
myapp.catalog.product.created
myapp.sales.payments.payment.recorded
myapp.sales.orders.order.completed
myapp.achievement.catalog.achievement.unlocked   ← con módulo intermedio
```

- Todo en `snake_case` — sin mayúsculas, sin guiones
- El bounded context es el nombre de la carpeta raíz del BC
- El módulo es opcional — solo cuando hay submódulo explícito dentro del BC
- La acción en participio pasado en inglés: `created`, `updated`, `removed`, `recorded`, `completed`

## Decision Gates

| Situación | Acción |
|---|---|
| Nuevo domain event | Usa el template de `assets/domain-event.template.md` |
| El evento tiene atributos específicos | Extender `DomainEventAttributes` |

## Execution Steps

1. Define el evento con el patrón canónico de `references/patterns.md`.
2. Registra el evento en el aggregate con `record()`. Los `attributes` contienen los campos relevantes del aggregate para el evento — habitualmente un subconjunto de `toPrimitives()` o los valores necesarios para los subscribers.
3. Ubica el archivo según la sección de ubicación de `references/patterns.md`.
4. Revisa los anti-patterns de `references/patterns.md`.

## References

- [`references/patterns.md`](references/patterns.md) — `DomainEvent` base class, patrón canónico, registro en el aggregate, attributes tipado, ubicación de archivos y anti-patterns.
- [`assets/domain-event.template.md`](assets/domain-event.template.md) — template de un nuevo domain event.
- [`references/docs.md`](references/docs.md) — naming conventions, ADRs y skills relacionadas.
