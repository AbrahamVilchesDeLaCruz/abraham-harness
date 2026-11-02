---
name: api-domain
description: "Trigger: Al crear o modificar aggregates, value objects, interfaces de repositorio o errores de dominio en apps/api/. Convenciones de la capa Domain en la API: AggregateRoot, Value Objects, Repository interface y Domain Errors."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

- Al crear un nuevo aggregate root
- Al crear o modificar un value object
- Al definir una interface de repositorio
- Al crear un error de dominio

## Hard Rules

### Aggregate Root

- Extiende `AggregateRoot<Primitives>` — typed con sus primitivos para forzar `fromPrimitives` y `toPrimitives`.
- Sin decoradores NestJS ni TypeORM
- Dos factories estáticas: `create()` para entidades nuevas (registra eventos), `fromPrimitives()` para reconstitución desde persistencia (sin eventos)
- `Primitives` contiene tipos escalares: `string`, `number`, `boolean`, `Date`, `null` — se permiten arrays y objetos primitivos anidados para entidades hijas
- Estado mutable (campos que cambian tras la creación) → `private _campo` con getter público
- Estado inmutable (no cambia tras la creación) → `public readonly campo` directamente en el constructor
- Lógica de negocio aquí — nunca en los casos de uso

### Value Objects

- Jerarquía para IDs: `ValueObject<string>` → `StringValueObject` → `UuidValueObject` → `XxxId`.
- Jerarquía para campos de texto: `ValueObject<string>` → `StringValueObject` → concreto.
- Sin sufijo `VO` ni `ValueObject` en nombre de archivo ni clase
- IDs de aggregates extienden `UuidValueObject` (no `StringValueObject` directamente) — validación UUID antes del `super()`
- IDs compartidos entre BCs van en `shared/domain/`; VOs propios del BC van en su `domain/`
- Validación en el constructor — lanza `DomainException` si inválido
- `equals()` heredado — no reimplementar

### Repository Interface

- El contrato base incluye `match`, `search`, `save`, `remove`. Cada aggregate puede añadir métodos adicionales según sus necesidades (p. ej. `count`, `saveAll`). Se exporta también el Symbol de DI junto a la interface.

### Domain Errors

- La clase base es `DomainException`, ubicada en `shared/domain/exceptions/domain-exception.ts`.
- Nombre: `{Entidad}{Problema}` — sin sufijo `Error` ni `Exception`
- Extienden `DomainException` — nunca `Error` directamente
- Ubicación: `{bc}/domain/exceptions/` (subfolder, no en la raíz de `domain/`)
- Solo describen QUÉ pasó — el controller decide el HTTP status

## Decision Gates

| Método | Semántica |
| --- | --- |
| `match(criteria)` | Búsqueda con filtros, orden, paginación |
| `count(criteria)` | Cuenta sin traer entidades |
| `search(id)` | Por id — retorna `null` si no existe |
| `save(aggregate)` | Crea o actualiza (upsert) |
| `saveAll(list)` | Upsert en lote (cuando aplique) |
| `remove(id)` | Elimina por id |

## Execution Steps

1. Parte del template del aggregate o value object cuando corresponda.
2. Aplica las Hard Rules de la pieza que estás creando o modificando.
3. Contrasta con los anti-patterns de `references/patterns.md`.

## Output Contract

Entrega el aggregate, value object, interface de repositorio o error de dominio en la ubicación que indican las Hard Rules.

## References

- [`references/patterns.md`](references/patterns.md): código de aggregate root, value objects, repositorio, domain errors y anti-patterns.
- Usa los templates de [`assets/aggregate-root.template.md`](assets/aggregate-root.template.md) y [`assets/value-object.template.md`](assets/value-object.template.md).
- Lee [`references/docs.md`](references/docs.md) para invariants vs. domain errors y referencias DDD.
