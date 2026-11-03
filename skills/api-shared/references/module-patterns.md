# Module Patterns — Reference

The complete module code and the env schema live in the project's stack skills, in `references/api-shared.md`.

## Global shared module

Global module in `src/shared/infrastructure/framework/`:

- Imports: the shared module of each bounded context, never a submodule directly.
- Controllers: `HealthGetController`.
- Providers: `LOGGER_SERVICE` bound to the logger adapter, `GlobalExceptionRegistry`, `HttpExceptionFilter` registered as the global filter, and the event bus adapter as a singleton shared by all modules, aliased to `DOMAIN_EVENT_PUBLISHER` and `DOMAIN_EVENT_CONSUMER`.
- Exports: `LOGGER_SERVICE`, `GlobalExceptionRegistry`, `HttpExceptionFilter`, `DOMAIN_EVENT_PUBLISHER`, `DOMAIN_EVENT_CONSUMER`.

> **Important**: the shared module does **not** contain the config module or the persistence module.
> They are configured in the application root module (see the next section).

---

## The application root module — config + persistence + global wiring

The application root module imports:

- The config module: global, with `.env.local` and `.env` under `process.cwd()` as env files, `envValidationSchema` as the validation schema, and abort-early off.
- The persistence root connection, through a factory function that returns the data source options.
- The scheduler module.
- The rate limiter, with two named limits, both skipped when `process.env.NODE_ENV === 'test'`: `default` (ttl `60_000`, limit `100`) and `auth` (ttl `60_000`, limit `10`).
- The shared module. The bounded contexts reach the application through it, so they are not imported here.

It also registers the rate limiter's guard as a global guard.

---

## Data source options

Persistence is configured with `DATABASE_URL` (a single variable), not with separate variables per field. The builder lives in `src/shared/infrastructure/persistence/` and:

- Accepts optional flags to run migrations on startup and to enable logging.
- Derives host, port (default `5432`), username, password, database and SSL from the parsed URL.
- Names the migrations table `'migrations'`, runs migrations on startup by default outside production, and enables logging by default outside production and test. An explicit option overrides either default.
- Never enables automatic schema synchronization in production.

---

## Bounded Context Modules

A bounded context has several submodules, and works almost as a modular monolith.

**Each submodule** has a complete framework module in `{bc}/{module}/infrastructure/framework/`, which wires its repositories, use cases, controllers, subscribers and exception registry, and exports the registry.

The user-achievement module, in `src/achievement/user-achievement/infrastructure/framework/`, wires:

- Repositories — registered with a DI token (`USER_ACHIEVEMENT_REPOSITORY`).
- Use cases (`AchievementsSearcher`) and controllers (`SearchAchievementsGetController`).
- Subscribers — wired via a factory (`SUBSCRIBERS`, `SubscribersBootstrapper`).
- The submodule's exception registry (`UserAchievementExceptionRegistry`).

Exports: `UserAchievementExceptionRegistry` and `USER_ACHIEVEMENT_REPOSITORY` (repository token — never the concrete implementation).

**The bounded context's shared module**, in `{bc}/shared/infrastructure/framework/`, imports and re-exports its submodules' modules. It gathers their registries, and it is what the root shared module imports.

**Keys of the module pattern:**
- Imports the auth module (does not declare it global). It never imports the root shared module: that module is global, and it imports the bounded context
- Registers its persistence entities
- Uses tokens (`PRODUCT_REPOSITORY`, `LOGGER_SERVICE`) — never concrete classes directly in injection lists
- Exports its exception registry, plus only what other BCs need — DI tokens or domain services

---

## `env.validation.ts` — environment variables

The schema lives in `src/shared/infrastructure/config/env.validation.ts`:

- App: `NODE_ENV` (`development`, `production`, `test`; required), `PORT` (default `3000`), `FRONTEND_URL` (URI, default `http://localhost:4001`), `CORS_ORIGIN` (default `http://localhost:4001,http://localhost:5173`), `USE_STUB_ADAPTERS` (boolean, `true`/`1`/`false`/`0`, default `false`).
- Database — a single URL with all the credentials: `DATABASE_URL` (required), `DATABASE_CA_CERT` (optional).
- Auth: `JWT_SECRET` (at least 32 characters, required), `JWT_EXPIRES_IN` (default `15m`).
- Google OAuth (required): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` (URI).
- Messaging: the broker URI (required). External services (required): `EMAIL_PROVIDER_API_KEY`, `CLOUD_STORAGE` (URI), `CLOUD_STORAGE_PUBLIC_URL` (URI), `CLOUD_STORAGE_ACCESS_KEY_ID`, `CLOUD_STORAGE_SECRET_ACCESS_KEY`, `CLOUD_STORAGE_BUCKET`.
- Observability: the log store URL (URI, optional), `LOG_LEVEL` (`trace`, `debug`, `info`, `warn`, `error`, `fatal`; default `info`).

**Key differences from a basic schema:**
- Single `DATABASE_URL` instead of separate variables (`DB_HOST`, `DB_PORT`, `DB_USER`, etc.)
- `JWT_REFRESH_SECRET` does not exist — refresh is managed in a different way
- A single broker URI for the message broker
- `USE_STUB_ADAPTERS` — flag to replace real adapters with stubs in local/test
- The log store URL is optional (observability can be disabled)
