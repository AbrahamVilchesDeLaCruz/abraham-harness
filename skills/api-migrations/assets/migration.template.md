# Template — Migration

Replace `__TIMESTAMP__` and `__table_name__` with the real values.

```typescript
// Naming: Migration{YYYYMMDDHHmmss}{epochMs}
// Example: Migration202606291200001779990000008
export class Migration__TIMESTAMP__ {
  name = 'Migration__TIMESTAMP__';

  public async up(db): Promise<void> {
    // Raw SQL always — never the ORM's query builder (fragile across version changes)
    await db.query(`
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

  public async down(db): Promise<void> {
    // Revert completely — always implement
    await db.query(`DROP TABLE IF EXISTS "__table_name__"`);
  }
}
```
