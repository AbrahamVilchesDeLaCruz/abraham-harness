---
name: api-criteria
description: "Trigger: When building queries with filters, order or pagination in apps/api/. Criteria pattern conventions in the API: construction from query params, use in use cases and repositories."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.1"
---


## Activation Contract

- When implementing an endpoint with filters, order or pagination
- When passing search criteria from controller to use case to repository
- When implementing `match(criteria)` in a persistence repository

## Hard Rules

- `Criteria` lives in `shared/domain/` — it is cross-cutting to all bounded contexts
- `Criteria` is built by the **use case or domain services** — never by the controller or the repository
- The controller passes primitives as part of the `Request*` — it never passes a `Criteria` object
- The repository only consumes `Criteria` — it never receives loose filters as parameters
- When a paginated result needs a total, the repository exposes `count(criteria: Criteria): Promise<number>` next to `match()`; do not add named finder methods for individual filter combinations.
- `value: null` with `EQ`/`NEQ` → `IS NULL` / `IS NOT NULL` (never `= null` in SQL)
- Use the `OrderDirection` enum — not string literals `'ASC'` / `'DESC'`
- `Criteria.fromPrimitives()` does not exist — use the constructor directly

## Decision Gates

| Situation | Action |
| --- | --- |
| Building any criteria | Always `new Criteria([...])` |
| When not all filters are required | Build the array dynamically |
| The client sends `page` + `pageSize` | The use case passes them to `Criteria` and runs `match` and `count` in parallel |

## Execution Steps

1. Receive the primitives in the use case's `Request*`.
2. Build `Criteria` in the use case or domain service; use `references/patterns.md` for optional filters and pagination.
3. Consume `Criteria` in the repository; use `references/repository-criteria.md` for `match()`.
4. Check against the anti-patterns in `references/patterns.md`.

## Output Contract

Deliver the use case or domain service that builds `Criteria` and the repository that consumes it with `match()` and `count()`.

## References

- [`references/patterns.md`](references/patterns.md): `Criteria` structure, construction, optional filters, pagination and anti-patterns.
- Read [`references/repository-criteria.md`](references/repository-criteria.md) for what `match()` does, the Controller → UseCase → Repository flow and the operator table.
- Read [`references/docs.md`](references/docs.md) for related skills, ADRs and external documentation.
- Load the project's stack skills for HTTP (`stack-nestjs`) and persistence (the matching `stack-*`), and read `references/api-criteria.md` in each for the complete `match()`.
