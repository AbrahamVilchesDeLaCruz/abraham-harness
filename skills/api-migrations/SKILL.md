---
name: api-migrations
description: "Trigger: Al crear una nueva migración TypeORM, añadir seeds de datos iniciales o de prueba. TypeORM migrations formato, seeds idempotentes en apps/api/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

- Al crear una nueva migración TypeORM
- Al añadir seeds de datos iniciales o de prueba
- Al entender cuándo correr migrations vs seeds

## Hard Rules

Migrations:

- `up` — aplica el cambio
- `down` — lo revierte **completamente** — siempre implementar
- SQL raw en migraciones — nunca usar el QueryBuilder de TypeORM (frágil ante cambios de versión)
- `synchronize: false` en TypeORM config — **siempre**
- Las migraciones son la **única fuente de verdad** del schema

Seeds:

- Los seeds son **idempotentes** — verificar con `SELECT COUNT(*)` antes de insertar
- Usar **SQL raw** (`dataSource.query()`) — no entity repositories ni QueryBuilder. Eso los hace independientes del ORM y de los tipos de entidad.
- Llamar `AppDataSource.runMigrations()` antes de seedear — garantiza que el schema existe
- Guardar UUIDs fijos en seeds de producción para referencias cruzadas estables

## Decision Gates

| Seed | Entornos |
|---|---|
| Datos de prueba | Solo `development` / `test` |
| Datos iniciales de producción (ej: roles, categorías base) | También en `production` |

## Execution Steps

1. Crea la migración a mano. Naming:

```
Migration{timestamp}

timestamp = YYYYMMDDHHmmss + epoch ms concatenados
```

> No existe script `migration:generate` en package.json — las migraciones se crean a mano con el template en `assets/migration.template.md`. El timestamp se compone de `YYYYMMDDHHmmss` + epoch en ms concatenados (ej: `202605230526271779506787479`).

2. Ubícala en:

```
src/shared/infrastructure/persistence/migrations/
└── Migration202605230526271779506787479.ts
└── Migration202605241854361779641676650.ts
```

3. Usa los comandos:

```bash
# Correr migraciones pendientes (requiere credenciales de DB en el entorno)
pnpm migration:run

# Revertir última migración
pnpm migration:revert

# Ver estado de migraciones
pnpm migration:show

# Correr migraciones en local (usa .env.local)
pnpm migration:run:local
```

4. Los seeds van al mismo nivel que `migrations/`:

```
src/shared/infrastructure/persistence/
├── migrations/
│   └── Migration202605230526271779506787479.ts
└── seeds/
    ├── local-demo.seed.ts   ← datos de prueba locales
    └── run-local-seeds.ts   ← entry point del seed runner
```

5. Correr seeds: `pnpm seed:local`

## References

- [`references/examples.md`](references/examples.md) — ejemplo completo de migración, seed y seed runner.
- [`assets/migration.template.md`](assets/migration.template.md) — template de migración.
- [`references/docs.md`](references/docs.md) — skills relacionadas, ADRs y documentación externa.
