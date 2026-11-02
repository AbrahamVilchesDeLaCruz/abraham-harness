---
name: api-criteria
description: "Trigger: Al construir queries con filtros, orden o paginación en apps/api/. Convenciones del patrón Criteria en la API: construcción desde query params, uso en use cases y repositorios."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## Activation Contract

- Al implementar un endpoint con filtros, orden o paginación
- Al pasar criterios de búsqueda desde controller a use case a repositorio
- Al implementar `match(criteria)` en un repositorio TypeORM

## Hard Rules

- `Criteria` vive en `shared/domain/` — es transversal a todos los bounded contexts
- `Criteria` lo construyen el **use case o domain services** — nunca el controller ni el repositorio
- El controller pasa primitivos como parte del `Request*` — nunca pasa un objeto `Criteria`
- El repositorio solo consume `Criteria` — nunca recibe filtros sueltos por parámetro
- El repositorio debe exponer `count(criteria: Criteria): Promise<number>` junto a `match()`.
- `value: null` con `EQ`/`NEQ` → `IS NULL` / `IS NOT NULL` (nunca `= null` en SQL)
- Usar `OrderDirection` enum — no strings literales `'ASC'` / `'DESC'`
- No existe `Criteria.fromPrimitives()` — usar el constructor directamente

## Decision Gates

| Situación | Acción |
| --- | --- |
| Construcción de cualquier criterio | Siempre `new Criteria([...])` |
| Cuando no todos los filtros son obligatorios | Construir el array dinámicamente |
| El cliente envía `page` + `pageSize` (más natural que `offset`) | El use case convierte y ejecuta `match` y `count` en paralelo |

## Execution Steps

1. Recibe los primitivos en el `Request*` del use case.
2. Construye `Criteria` en el use case o domain service; usa `references/patterns.md` para filtros opcionales y paginación.
3. Consume `Criteria` en el repositorio; usa `references/repository-criteria.md` para `match()`.
4. Contrasta con los anti-patterns de `references/patterns.md`.

## Output Contract

Entrega el use case o domain service que construye `Criteria` y el repositorio que lo consume con `match()` y `count()`.

## References

- [`references/patterns.md`](references/patterns.md): estructura de `Criteria`, construcción, filtros opcionales, paginación y anti-patterns.
- Lee [`references/repository-criteria.md`](references/repository-criteria.md) para la implementación completa del `match()`, el flujo Controller → UseCase → Repository y la tabla de operadores.
- Lee [`references/docs.md`](references/docs.md) para skills relacionadas, ADRs y documentación externa.
