# TypeORM — docs/engineering/testing.md

TypeORM details for the concepts in `docs/engineering/testing.md`.

## Migrations in E2E

If the schema changes, it is applied automatically on the next `make test:e2e:up` (TypeORM `migrationsRun: true`).

## Known gotchas

| Problem | Cause | Solution |
|---|---|---|
| `SSL required` in E2E | TypeORM in non-test mode uses SSL | `ssl: false` when `NODE_ENV=test` in `typeorm.config.ts` |
