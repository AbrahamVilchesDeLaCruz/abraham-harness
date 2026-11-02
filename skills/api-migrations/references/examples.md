# Migrations y Seeds — Ejemplos

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
        "expression" VARCHAR     NOT NULL,
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
  // idempotente — verificar antes de insertar
  const existing = await dataSource.query<{ count: string }[]>(
    `SELECT COUNT(*)::text AS count FROM users WHERE email = $1`,
    [DEMO_EMAIL],
  );

  if (parseInt(existing[0]?.count ?? '0', 10) > 0) {
    process.stdout.write('Local demo seed already applied — skipping.\n');
    return;
  }

  await dataSource.query(
    `INSERT INTO users (id, email, nickname, role, longest_streak, created_at, updated_at)
     VALUES ($1, $2, 'demo', 'admin', true, 0, 0, NOW(), NOW())`,
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
  await AppDataSource.runMigrations(); // asegura que el schema existe antes de seedear
  await seedLocalDemo(AppDataSource);
  await AppDataSource.destroy();
}

run().catch((error: unknown) => {
  process.stderr.write(`Local seed failed: ${String(error)}\n`);
  process.exit(1);
});
```
