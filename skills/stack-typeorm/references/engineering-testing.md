# TypeORM — testing.md in engineering-conventions

TypeORM details for the concepts in `testing.md` in `engineering-conventions`.

## Migrations in E2E

If the schema changes, it is applied automatically the next time the test database starts (TypeORM `migrationsRun: true`).

## Known gotchas

| Problem | Cause | Solution |
|---|---|---|
| `SSL required` in E2E | TypeORM in non-test mode uses SSL | `ssl: false` when `NODE_ENV=test` in `typeorm.config.ts` |
