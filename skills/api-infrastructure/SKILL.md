---
name: api-infrastructure
description: "Trigger: Al crear o modificar controllers, entidades TypeORM, repositorios o módulos en apps/api/. Convenciones de la capa Infrastructure en la API: Controllers, TypeORM entities, repositorios y módulos NestJS."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## Activation Contract

- Al crear o modificar un controller
- Al crear una TypeORM entity o repositorio
- Al crear o modificar un módulo NestJS

## Hard Rules

### Controllers

- Un controller por acción. Nombre: `{Verb}{Entity}{Method}Controller`. Método siempre `handler()`.
- Archivo: `{verb}-{resource}-{method}.controller.ts` — `start-order-post.controller.ts`
- Clase: `{Verb}{Resource}{Method}Controller` — `StartOrderPostController`
- Payload (POST/PATCH body): `{Verb}{Resource}{Method}Payload`
- Query (GET params): `{Verb}{Resource}{Method}Query`
- Un controller = un caso de uso = una responsabilidad
- Sin lógica — recibe HTTP, construye el `Request*`, delega al use case, devuelve respuesta
- Swagger obligatorio: `@ApiTags`, `@ApiOperation`, `@ApiBearerAuth`, respuestas con status codes
- `resolveRequestId(req)` en todos los endpoints que devuelven envelope

### Payloads y Queries

- Solo en infrastructure — nunca pasan a application
- El controller construye el `Request*` del use case a partir del payload/query
- `@IsOptional()` para campos opcionales
- `@Type(() => Number)` en Query únicamente para `page`, `limit` (strings en HTTP)
- `@ApiProperty` / `@ApiPropertyOptional` en todos los campos

### TypeORM Entities

- Sufijo `Entity` — diferencia la entidad de domain
- Tabla en `snake_case` plural: `orders`, `products`
- Columnas: `snake_case` en DB, `camelCase` en código — usar `name` en `@Column`
- Solo en `infrastructure/persistence/` — nunca en domain ni application

### Repositorios TypeORM

- Prefijo `TypeOrm` — deja claro la implementación concreta
- `toDomain()` y `toEntity()` privados — la TypeORM Entity nunca sale del repositorio
- `match()` SIEMPRE aplica todos los campos de `Criteria`: filters, order, limit, offset
- `value: null` + `EQ`/`NEQ` → `IS NULL` / `IS NOT NULL` (nunca `= null` en SQL)

## Decision Gates

| Tipo de endpoint | Respuesta | Status |
| --- | --- | --- |
| Commands con datos (POST que crea) | `ApiResponse<T>` | `201` |
| Commands puros (PATCH/DELETE) | `void` | `204` |
| Queries (GET) | `ApiResponse<T>` o `PaginatedApiResponse<T>` | `200` |

## Execution Steps

1. Ubica cada pieza en la estructura de carpetas de `references/patterns.md`.
2. Aplica las Hard Rules de la pieza y carga la referencia de su patrón completo.
3. Contrasta con los anti-patterns de `references/patterns.md`.

## Output Contract

Entrega el controller, payload o query, TypeORM entity, repositorio o módulo NestJS en su carpeta de `infrastructure/`.

## References

- [`references/patterns.md`](references/patterns.md): estructura de carpetas y anti-patterns.
- Lee [`references/controller-patterns.md`](references/controller-patterns.md) cuando necesites el patrón completo de Swagger, Payloads o Query GET.
- Lee [`references/repository-patterns.md`](references/repository-patterns.md) cuando necesites la implementación completa de TypeORM con Criteria o el módulo NestJS.
- Lee [`references/docs.md`](references/docs.md) para skills relacionadas, ADRs y documentación externa.
