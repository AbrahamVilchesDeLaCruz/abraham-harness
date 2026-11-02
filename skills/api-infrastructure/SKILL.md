---
name: api-infrastructure
description: "Trigger: When creating or modifying controllers, persistence entities, repositories or modules in apps/api/. Infrastructure layer conventions in the API: controllers, persistence entities, repositories and framework modules."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---


## Activation Contract

- When creating or modifying a controller
- When creating a persistence entity or repository
- When creating or modifying a framework module

## Hard Rules

### Controllers

- One controller per action. Name: `{Verb}{Entity}{Method}Controller`. Method always `handler()`.
- File: `{verb}-{resource}-{method}.controller.ts` — `start-order-post.controller.ts`
- Class: `{Verb}{Resource}{Method}Controller` — `StartOrderPostController`
- Payload (POST/PATCH body): `{Verb}{Resource}{Method}Payload`
- Query (GET params): `{Verb}{Resource}{Method}Query`
- One controller = one use case = one responsibility
- No logic — receives HTTP, builds the `Request*`, delegates to the use case, returns the response
- API documentation is mandatory: tags, operation, bearer auth, responses with status codes
- `resolveRequestId(req)` on all endpoints that return an envelope

### Payloads and Queries

- Only in infrastructure — they never pass into application
- The controller builds the use case's `Request*` from the payload/query
- Mark optional fields as optional
- Coerce to number in a Query only for `page`, `limit` (strings in HTTP)
- API documentation on all fields

### Persistence Entities

- `Entity` suffix — distinguishes it from the domain entity
- Table in plural `snake_case`: `orders`, `products`
- Columns: `snake_case` in the DB, `camelCase` in code — name the column explicitly in its mapping
- Only in `infrastructure/persistence/` — never in domain or application

### Persistence Repositories

- Prefix with the persistence technology — makes the concrete implementation clear
- `toDomain()` and `toEntity()` are private — the persistence entity never leaves the repository
- `match()` ALWAYS applies all the `Criteria` fields: filters, order, limit, offset
- `value: null` + `EQ`/`NEQ` → `IS NULL` / `IS NOT NULL` (never `= null` in SQL)

## Decision Gates

| Endpoint type | Response | Status |
| --- | --- | --- |
| Commands with data (POST that creates) | `ApiResponse<T>` | `201` |
| Pure commands (PATCH/DELETE) | `void` | `204` |
| Queries (GET) | `ApiResponse<T>` or `PaginatedApiResponse<T>` | `200` |

## Execution Steps

1. Place each piece in the folder structure from `references/patterns.md`.
2. Apply the piece's Hard Rules and load the reference with its complete pattern.
3. Check against the anti-patterns in `references/patterns.md`.

## Output Contract

Deliver the controller, payload or query, persistence entity, repository or framework module in its `infrastructure/` folder.

## References

- [`references/patterns.md`](references/patterns.md): folder structure and anti-patterns.
- Read [`references/controller-patterns.md`](references/controller-patterns.md) when you need the complete controller, Payload or GET Query pattern.
- Read [`references/repository-patterns.md`](references/repository-patterns.md) when you need the repository mapping and the persistence entity.
- Read [`references/docs.md`](references/docs.md) for related skills, ADRs and external documentation.
- Load the project's stack skills for HTTP (`stack-nestjs`) and persistence (the matching `stack-*`), and read `references/api-infrastructure.md` in each.
