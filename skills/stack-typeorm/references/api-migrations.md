# api-migrations with TypeORM

Apply the rules of `api-migrations`. This reference shows the TypeORM implementation.

## Rules

- Raw SQL in migrations — never use TypeORM's `QueryBuilder` (fragile across version changes).
- `synchronize: false` in the TypeORM config — **always**.
- Seeds use **raw SQL** (`dataSource.query()`) — no entity repositories or `QueryBuilder`.
- Call `AppDataSource.runMigrations()` before seeding — it guarantees the schema exists.

## Migration

```typescript
// src/shared/infrastructure/persistence/migrations/Migration202605230526271779506787479.ts
import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Migration202605230526271779506787479 implements MigrationInterface {
  name = 'Migration202605230526271779506787479';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id"         UUID        NOT NULL,
        "name" VARCHAR     NOT NULL,
        "created_at" TIMESTAMP   NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP   NOT NULL DEFAULT now(),
        CONSTRAINT "PK_products" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "products"`);
  }
}
```

## Seeds

```typescript
// src/shared/infrastructure/persistence/seeds/local-demo.seed.ts
import { type DataSource } from 'typeorm';

export const DEMO_USER_ID = '00000000-0000-4000-a000-000000000001';
export const DEMO_EMAIL = 'demo@local.dev';

export async function seedLocalDemo(dataSource: DataSource): Promise<void> {
  // idempotent — check before inserting
  const existing = await dataSource.query<{ count: string }[]>(
    `SELECT COUNT(*)::text AS count FROM users WHERE email = $1`,
    [DEMO_EMAIL],
  );

  if (parseInt(existing[0]?.count ?? '0', 10) > 0) {
    process.stdout.write('Local demo seed already applied — skipping.\n');
    return;
  }

  await dataSource.query(
    `INSERT INTO users (id, email, nickname, role, created_at, updated_at)
     VALUES ($1, $2, 'demo', 'admin', NOW(), NOW())`,
    [DEMO_USER_ID, DEMO_EMAIL],
  );

  process.stdout.write(`Local demo seed complete.\n`);
}
```

```typescript
// src/shared/infrastructure/persistence/seeds/run-local-seeds.ts
import { AppDataSource } from '../typeorm/typeorm.config.cli';
import { seedLocalDemo } from './local-demo.seed';

async function run(): Promise<void> {
  await AppDataSource.initialize();
  await AppDataSource.runMigrations(); // ensures the schema exists before seeding
  await seedLocalDemo(AppDataSource);
  await AppDataSource.destroy();
}

run().catch((error: unknown) => {
  process.stderr.write(`Local seed failed: ${String(error)}\n`);
  process.exit(1);
});
```

## Template

Replace `__TIMESTAMP__` and `__table_name__` with the real values.

The timestamp is generated automatically with `typeorm migration:generate`.

```typescript
import { type MigrationInterface, type QueryRunner } from 'typeorm';

// Naming: Migration{YYYYMMDDHHmmss}{epochMs}
// Example: Migration202606291200001779990000008
export class Migration__TIMESTAMP__ implements MigrationInterface {
  name = 'Migration__TIMESTAMP__';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Raw SQL always — never QueryBuilder (fragile across TypeORM version changes)
    await queryRunner.query(`
      CREATE TABLE "__table_name__" (
        "id"         uuid        NOT NULL,
        "created_at" TIMESTAMP   NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP   NOT NULL DEFAULT now(),
        CONSTRAINT "PK___table_name__" PRIMARY KEY ("id")
        -- Example additional columns:
        -- "name"    character varying(255) NOT NULL,
        -- "score"   integer                NOT NULL DEFAULT 0,
        -- "user_id" uuid                   NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert completely — always implement
    await queryRunner.query(`DROP TABLE IF EXISTS "__table_name__"`);
  }
}
```

## Never use `synchronize: true` in production

`synchronize: true` applies schema changes automatically at startup — it can drop columns or data in production. Always use explicit migrations.

## Related

- `api-infrastructure`: TypeORM entities reflect the structure that migrations create.
- `api-shared`: `TypeOrmModule` — `synchronize: false`, `migrationsRun: false`.

## External Documentation

- [TypeORM — Migrations](https://typeorm.io/migrations) — `generate`, `run`, `revert`, `show`
- [TypeORM — Migration API](https://typeorm.io/migrations#using-migration-api-to-write-migrations) — `QueryRunner` methods

The concept skill uses the neutral name `db` for `queryRunner`, `dataSource` and `AppDataSource`.
