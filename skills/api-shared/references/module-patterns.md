# Module Patterns — Reference

The complete module code and the env schema live in the project's stack skills, in `references/api-shared.md`.

## Global `SharedModule`

Global module in `src/shared/infrastructure/framework/shared.module.ts`:

- Controllers: `HealthGetController`.
- Providers: `LOGGER_SERVICE` bound to the logger adapter, `GlobalExceptionRegistry`, `HttpExceptionFilter` registered as the global filter, and the event bus adapter as a singleton shared by all modules, aliased to `DOMAIN_EVENT_PUBLISHER` and `DOMAIN_EVENT_CONSUMER`.
- Exports: `LOGGER_SERVICE`, `GlobalExceptionRegistry`, `HttpExceptionFilter`, `DOMAIN_EVENT_PUBLISHER`, `DOMAIN_EVENT_CONSUMER`.

> **Important**: `SharedModule` does **not** contain the config module or the persistence module.
> They are configured in `AppModule` (see the next section).

---

## `AppModule` — config + persistence + global wiring

`src/app.module.ts` imports:

- The config module: global, with `.env.local` and `.env` under `process.cwd()` as env files, `envValidationSchema` as the validation schema, and abort-early off.
- The persistence root connection, through a factory function that returns the data source options.
- The scheduler module.
- The rate limiter, with two named limits, both skipped when `process.env.NODE_ENV === 'test'`: `default` (ttl `60_000`, limit `100`) and `auth` (ttl `60_000`, limit `10`).
- `SharedModule` and the BC modules (`IdentityModule`, `CatalogModule`, `SalesModule`, ...).

It also registers the rate limiter's guard as a global guard.

---

## Data source options

Persistence is configured with `DATABASE_URL` (a single variable), not with separate variables per field. The builder lives in `src/shared/infrastructure/persistence/` and:

- Accepts optional `migrationsRun` and `logging`.
- Derives host, port (default `5432`), username, password, database and SSL from the parsed URL.
- Sets `migrationsTableName` to `'migrations'`, `migrationsRun` to `options?.migrationsRun ?? !isProd`, and `logging` to `options?.logging ?? (!isProd && !isTest)`.
- Never enables automatic schema synchronization in production.

---

## Complete Bounded Context Module

BC modules are complete framework modules that wire the whole BC: repositories, use cases, controllers, subscribers and the exception registry. They live in `{bc}/shared/infrastructure/framework/`.

`src/achievement/shared/infrastructure/framework/achievement.module.ts` wires:

- Repositories — registered with a DI token (`USER_ACHIEVEMENT_REPOSITORY`, `USER_ACHIEVEMENT_PROGRESS_REPOSITORY`).
- Domain services (`AchievementCatalog`).
- Use cases (`AchievementsSearcher`) and controllers (`SearchAchievementsGetController`).
- Subscribers — wired via a factory (`SUBSCRIBERS`, `SubscribersBootstrapper`).
- The BC's exception registry (`AchievementExceptionRegistry`).

Exports: `AchievementCatalog` (domain service — needed by other BCs) and `USER_ACHIEVEMENT_REPOSITORY` (repository token — never the concrete implementation).

**Keys of the BC module pattern:**
- Imports `SharedModule` and `AuthModule` (does not declare them global)
- Registers its persistence entities
- Uses tokens (`PRODUCT_REPOSITORY`, `LOGGER_SERVICE`) — never concrete classes directly in injection lists
- Exports only what other BCs need — DI tokens or domain services

---

## `env.validation.ts` — environment variables

The schema lives in `src/shared/infrastructure/config/env.validation.ts`:

- App: `NODE_ENV` (`development`, `production`, `test`; required), `PORT` (default `3000`), `FRONTEND_URL` (URI, default `http://localhost:4001`), `CORS_ORIGIN` (default `http://localhost:4001,http://localhost:5173`), `USE_STUB_ADAPTERS` (boolean, `true`/`1`/`false`/`0`, default `false`).
- Database — a single URL with all the credentials: `DATABASE_URL` (required), `DATABASE_CA_CERT` (optional).
- Auth: `JWT_SECRET` (at least 32 characters, required), `JWT_EXPIRES_IN` (default `15m`).
- Google OAuth (required): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` (URI).
- Messaging: `AMQP_URI` (required). External services (required): `ELEVEN_LABS_API_KEY`, `CLOUD_STORAGE` (URI), `CLOUD_STORAGE_PUBLIC_URL` (URI), `CLOUD_STORAGE_ACCESS_KEY_ID`, `CLOUD_STORAGE_SECRET_ACCESS_KEY`, `CLOUD_STORAGE_BUCKET`.
- Observability: `LOKI_URL` (URI, optional), `LOG_LEVEL` (`trace`, `debug`, `info`, `warn`, `error`, `fatal`; default `info`).

**Key differences from a basic schema:**
- Single `DATABASE_URL` instead of separate variables (`DB_HOST`, `DB_PORT`, `DB_USER`, etc.)
- `JWT_REFRESH_SECRET` does not exist — refresh is managed in a different way
- `AMQP_URI` for the message broker
- `USE_STUB_ADAPTERS` — flag to replace real adapters with stubs in local/test
- `LOKI_URL` is optional (observability can be disabled)
