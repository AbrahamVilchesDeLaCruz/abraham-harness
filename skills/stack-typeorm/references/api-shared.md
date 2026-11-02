# api-shared with TypeORM

The concept skill `api-shared` defines the rules. This reference shows how to apply them with TypeORM.

## Rules

- TypeORM is configured through `buildTypeOrmDataSourceOptions()`, which parses `DATABASE_URL`.
- `synchronize: false` **always** — migrations are the source of truth of the schema.
- The Criteria pattern is applied **directly in each repository** with QueryBuilder — there is no shared converter. Each repository applies its own filters because it can have different relations and aliases.

## TypeORM Data Source Options

TypeORM is configured with `DATABASE_URL` (a single variable), not with separate variables per field:

```typescript
// src/shared/infrastructure/persistence/typeorm/typeorm-data-source-options.ts
export function buildTypeOrmDataSourceOptions(options?: {
  migrationsRun?: boolean;
  logging?: boolean;
}): DataSourceOptions {
  const isProd = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';
  const dbUrl = parseDatabaseUrl(process.env.DATABASE_URL);

  return {
    type: 'postgres',
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port || '5432', 10),
    username: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.replace('/', ''),
    ssl: resolveDbSsl(dbUrl.hostname),
    entities: typeOrmEntities,
    migrations: typeOrmMigrations,
    migrationsTableName: 'migrations',
    migrationsRun: options?.migrationsRun ?? !isProd,
    synchronize: false,   // NEVER true in production
    logging: options?.logging ?? (!isProd && !isTest),
  };
}
```

## External Documentation

- [TypeORM — Data Source](https://typeorm.io/data-source) — `forRootAsync` with a factory
