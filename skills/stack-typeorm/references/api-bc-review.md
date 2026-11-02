# api-bc-review with TypeORM

Apply the process of `api-bc-review`. These are the TypeORM forms of its checks.

## Audit checklist

- Phase 4: TypeORM entities have `Entity` suffix — differ from domain aggregates.
- Phase 4: `toDomain()` and `toEntity()` are private — TypeORM entities never escape the repo.
- Phase 5: Module uses `forFeature([...entities])` for TypeORM registration.

## Phase 4 — Allowed suffixes

| Suffix | When |
|--------|--------|
| `Entity` | TypeORM in infrastructure |
| `TypeOrm` (prefix) | Concrete repo/query implementation |

## Phase 5 — Refactor order

In the Infrastructure step: **entity + migration in `typeorm-data-source-options.ts`**.

## Phase 7 — TypeORM

Skill: `api-migrations`. Every new entity in `typeOrmEntities` **and** its migration in `typeOrmMigrations`. Omitting it silently breaks E2E/CI via async subscribers.

Anti-pattern: a TypeORM entity not registered in `typeorm-data-source-options.ts`.
