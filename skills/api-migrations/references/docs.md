# api-migrations — Docs & References

## Related Skills

| Skill | Why read it |
|---|---|
| `api-infrastructure` | ORM entities — they reflect the structure that migrations create |
| `api-shared` | The ORM module — automatic schema synchronization and running migrations at startup are both off |

## External Documentation

- [PostgreSQL — ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html) — SQL reference for columns and constraints

## Migration commands

```bash
# Run pending migrations (requires DB credentials in the environment)
pnpm migration:run

# Revert last migration
pnpm migration:revert

# Show migration status
pnpm migration:show

# Run migrations locally (uses .env.local)
pnpm migration:run:local

# Run local demo seeds (runs migrations first, then seeds)
pnpm seed:local
```

> Migrations are created by hand — there is no `migration:generate` script. See `assets/migration.template.md` for the template.

## Available template

- `assets/migration.template.md` — template for migrations

## Never enable automatic schema synchronization in production

Automatic schema synchronization applies schema changes at startup — it can drop columns or data in production. Always use explicit migrations.
