---
name: api-migrations
description: "Trigger: When creating a new migration, or adding initial or test data seeds. Migration format and idempotent seeds in apps/api/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

- When creating a new migration
- When adding initial or test data seeds
- When understanding when to run migrations vs seeds

## Hard Rules

Migrations:

- `up` — applies the change
- `down` — reverts it **completely** — always implement it
- Raw SQL in migrations — never use the ORM's query builder (fragile across version changes)
- Automatic schema synchronization is disabled in the ORM config — **always**
- Migrations are the **single source of truth** for the schema

Seeds:

- Seeds are **idempotent** — check with `SELECT COUNT(*)` before inserting
- Use **raw SQL** — no entity repositories or query builder. That makes them independent of the ORM and of the entity types.
- Run pending migrations before seeding — it guarantees the schema exists
- Keep fixed UUIDs in production seeds for stable cross-references

## Decision Gates

| Seed | Environments |
|---|---|
| Test data | Only `development` / `test` |
| Initial production data (e.g. roles, base categories) | Also in `production` |

## Execution Steps

1. Create the migration by hand. Naming:

```
Migration{timestamp}

timestamp = YYYYMMDDHHmmss + epoch ms concatenated
```

> There is no `migration:generate` script in package.json — migrations are created by hand with the template in `assets/migration.template.md`. The timestamp is `YYYYMMDDHHmmss` + epoch in ms concatenated (e.g. `202605230526271779506787479`).

2. Place it in:

```
src/shared/infrastructure/persistence/migrations/
└── Migration202605230526271779506787479.ts
└── Migration202605241854361779641676650.ts
```

3. Use the commands:

```bash
# Run pending migrations (requires DB credentials in the environment)
pnpm migration:run

# Revert the last migration
pnpm migration:revert

# Show migration status
pnpm migration:show

# Run migrations locally (uses .env.local)
pnpm migration:run:local
```

4. Seeds go at the same level as `migrations/`:

```
src/shared/infrastructure/persistence/
├── migrations/
│   └── Migration202605230526271779506787479.ts
└── seeds/
    ├── local-demo.seed.ts   ← local test data
    └── run-local-seeds.ts   ← seed runner entry point
```

5. Run seeds: `pnpm seed:local`

## References

- [`references/examples.md`](references/examples.md) — full example of a migration, a seed and the seed runner.
- [`assets/migration.template.md`](assets/migration.template.md) — migration template.
- [`references/docs.md`](references/docs.md) — related skills, ADRs and documentation.
- Load the project's stack skill for persistence and read its `references/api-migrations.md` for the ORM's migration API and configuration.
