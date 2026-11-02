# api-migrations — Docs & References

## Related Skills

| Skill | Por qué leerla |
|---|---|
| `api-infrastructure` | TypeORM entities — reflejan la estructura que las migrations crean |
| `api-shared` | `TypeOrmModule` — `synchronize: false`, `migrationsRun: false` |

## External Documentation

- [TypeORM — Migrations](https://typeorm.io/migrations) — `generate`, `run`, `revert`, `show`
- [TypeORM — Migration API](https://typeorm.io/migrations#using-migration-api-to-write-migrations) — `QueryRunner` methods
- [PostgreSQL — ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html) — referencia SQL para columnas y constraints

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

> Las migraciones se crean a mano — no hay script `migration:generate`. Ver `assets/migration.template.md` para el template.

## Template disponible

- `assets/migration.template.md` — template para migrations TypeORM

## Never use `synchronize: true` in production

`synchronize: true` aplica cambios de schema automáticamente al arrancar — puede borrar columnas o datos en producción. Siempre usar migrations explícitas.
