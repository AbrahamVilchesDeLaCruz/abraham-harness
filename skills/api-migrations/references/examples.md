# Migrations and Seeds — Examples

These versions omit ORM imports and types. The originals are in the persistence stack skill, in `references/api-migrations.md`.

## Migration

```typescript
// src/shared/infrastructure/persistence/migrations/Migration202605230526271779506787479.ts

export class Migration202605230526271779506787479 {
  name = 'Migration202605230526271779506787479';

  public async up(db): Promise<void> {
    await db.query(`
      CREATE TABLE "products" (
        "id"         UUID        NOT NULL,
        "name" VARCHAR     NOT NULL,
        "created_at" TIMESTAMP   NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP   NOT NULL DEFAULT now(),
        CONSTRAINT "PK_products" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(db): Promise<void> {
    await db.query(`DROP TABLE IF EXISTS "products"`);
  }
}
```

## Seeds

```typescript
// src/shared/infrastructure/persistence/seeds/local-demo.seed.ts

export const DEMO_USER_ID = '00000000-0000-4000-a000-000000000001';
export const DEMO_EMAIL = 'demo@local.dev';

export async function seedLocalDemo(db): Promise<void> {
  // idempotent — check before inserting
  const existing = await db.query<{ count: string }[]>(
    `SELECT COUNT(*)::text AS count FROM users WHERE email = $1`,
    [DEMO_EMAIL],
  );

  if (parseInt(existing[0]?.count ?? '0', 10) > 0) {
    process.stdout.write('Local demo seed already applied — skipping.\n');
    return;
  }

  await db.query(
    `INSERT INTO users (id, email, nickname, role, created_at, updated_at)
     VALUES ($1, $2, 'demo', 'admin', NOW(), NOW())`,
    [DEMO_USER_ID, DEMO_EMAIL],
  );

  process.stdout.write(`Local demo seed complete.\n`);
}
```

```typescript
// src/shared/infrastructure/persistence/seeds/run-local-seeds.ts
import { seedLocalDemo } from './local-demo.seed';

async function run(): Promise<void> {
  await db.initialize();
  await db.runMigrations(); // ensures the schema exists before seeding
  await seedLocalDemo(db);
  await db.destroy();
}

run().catch((error: unknown) => {
  process.stderr.write(`Local seed failed: ${String(error)}\n`);
  process.exit(1);
});
```
