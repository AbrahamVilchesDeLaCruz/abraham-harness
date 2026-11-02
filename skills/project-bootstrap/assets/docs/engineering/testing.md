# Testing

> How tests actually run in this monorepo.
> Runner configuration and framework details: read `references/engineering-testing.md` in the stack skills that match this project's stack table.

---

## Test pyramid

```
         ┌─────────────────┐
         │      E2E        │  ← real HTTP requests against the real application + Docker Postgres
         ├─────────────────┤
         │  Integration    │  ← (does not apply yet — E2E covers this level)
         ├─────────────────┤
         │      Unit       │  ← use cases + domain with mocked ports
         └─────────────────┘
```

---

## Unit tests (`*.spec.ts`)

### What do they cover?

- Domain: Value Objects, Aggregates, entities.
- Application: Use Cases, with mocked repositories.

### How to run them

```bash
# From the monorepo root
pnpm test                          # all workspaces

# API only
pnpm --filter @myapp/api test

# With coverage
pnpm --filter @myapp/api test:cov

# In watch mode (development)
pnpm --filter @myapp/api test:watch
```

### Conventions

- One `*.spec.ts` file per use case / domain object
- Object Mother for fixtures: `*-mother.ts` next to the spec
- Mocks through the project's mocking library: no manual mock functions

---

## E2E tests (`*.e2e-spec.ts`)

### What do they cover?

The real HTTP contract: starts the complete application against a Postgres test DB and makes real HTTP requests. They validate that the controllers, guards, use cases and repositories work end to end.

### Required infrastructure

E2E tests need Postgres running **on port 5433** (not 5432 — do not interfere with local instances).

#### Locally

```bash
# 1. Start the test Postgres (Docker)
make test:e2e:up

# 2. Run the tests
pnpm --filter @myapp/api test:e2e

# 3. Stop the infrastructure
make test:e2e:down
```

Or all at once (up, run, down):

```bash
make test:e2e
```

#### In CI (GitHub Actions)

The `.github/workflows/ci.yml` workflow starts Postgres directly as a `service`:

```yaml
services:
  postgres:
    image: postgres:<version>-alpine
    env:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: myapp_test
    ports:
      - 5433:5432
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

**The secrets manager is not used in the E2E step**: the vars come from the committed `.env.test` (it contains only test values, no real secrets).

### Environment variables for E2E tests

The vars are loaded automatically from `apps/api/.env.test` via `test/setup-env.ts`, registered in the E2E runner config.

```bash
# apps/api/.env.test (committed — no secrets)
NODE_ENV=test
DATABASE_URL=postgres://test:test@localhost:5433/myapp_test
JWT_SECRET=test-jwt-secret-at-least-32-chars-long
JWT_REFRESH_SECRET=test-jwt-refresh-secret-at-least-32-chars
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=30d
FRONTEND_URL=http://localhost:5173
```

### Test Docker Compose

`docker-compose.test.yml` at the monorepo root:

- **Image**: `postgres:<version>-alpine`
- **Port**: `5433:5432` (does not collide with local instances on 5432)
- **Storage**: `tmpfs` — ephemeral, destroyed when the container stops
- **Healthcheck**: `pg_isready` — the `--wait` in Docker Compose waits until it is ready before continuing

### Migrations in E2E

Migrations run **only once** when the test DB starts. The DB is ephemeral (tmpfs): each `make test:e2e:down` destroys it. If the schema changes, it is applied automatically on the next `make test:e2e:up`.

### E2E execution

- The E2E tests run **in series**, not in parallel (they share the same DB)

### E2E conventions

- One `*.e2e-spec.ts` file per functionality (e.g. `register-login-auth.e2e-spec.ts`)
- The `createTestApp()` helper in `test/shared/infrastructure/create-test-app.ts` centralizes the bootstrap of the test app
- Data cleanup: each suite deletes its own records in `afterEach` / `afterAll`
- Unique emails and nicknames per suite via `Date.now()`: avoids collisions between parallel suites (even though they run in series)
- Cookie extraction: `res.headers['set-cookie'][0].split(';')[0]` — the `Cookie` header only accepts `key=value`

---

## Quick reference commands

| Command                               | What it does                          |
| ------------------------------------- | ------------------------------------- |
| `pnpm test`                           | Unit tests in all workspaces          |
| `pnpm --filter @myapp/api test`       | Unit tests API only                   |
| `pnpm --filter @myapp/api test:cov`   | Unit tests + coverage                 |
| `pnpm --filter @myapp/api test:watch` | Unit tests in watch mode              |
| `make test:e2e`                       | Complete E2E: up + run + down         |
| `make test:e2e:up`                    | Only start the test Postgres          |
| `pnpm --filter @myapp/api test:e2e`   | Only run E2E (requires an active DB)  |
| `make test:e2e:down`                  | Stop and destroy the test Postgres    |
| `pnpm test:all`                       | Unit + E2E in all workspaces          |
| `pnpm test:ci`                        | Unit + coverage in CI mode            |

---

## Test file structure

```
apps/api/
├── {unit runner config}        ← config for unit tests
├── {E2E runner config}         ← config for E2E tests
├── .env.test                   ← environment vars for E2E (committed)
└── test/
    ├── setup-env.ts            ← loads .env.test before the application bootstrap
    ├── shared/
    │   ├── domain/             ← base Object Mothers (MotherCreator, UuidMother…)
    │   └── infrastructure/
    │       └── create-test-app.ts  ← helper: bootstraps the application for E2E
    └── identity/
        ├── domain/             ← Object Mothers of the identity BC
        ├── application/        ← unit specs + use case mothers
        └── infrastructure/     ← E2E specs
            ├── guest-auth-post.e2e-spec.ts
            ├── register-login-auth.e2e-spec.ts
            ├── refresh-logout-auth.e2e-spec.ts
            └── guards.e2e-spec.ts
```

---

## Coverage

Coverage is generated with `--coverage` and written to:

- Unit: `apps/api/coverage/unit/`
- E2E: `apps/api/coverage/e2e/`

In CI, coverage is collected for the report but **there is no minimum threshold** configured: the goal is visibility, not blocking the merge.

---

## Known gotchas

| Problem                                 | Cause                                               | Solution                                       |
| --------------------------------------- | --------------------------------------------------- | ---------------------------------------------- |
| `connect ECONNREFUSED 127.0.0.1:5433`   | The test Postgres is not running                    | `make test:e2e:up`                             |
| `SSL required` in E2E                   | The persistence layer uses SSL outside test mode    | Disable SSL when `NODE_ENV=test`               |
| `422` instead of `400` on validation    | The validation layer is configured to answer 422    | Expected: use 422 in the specs                 |
| E2E tests interfere with each other     | Shared data in the DB                               | Use unique emails/nicknames via `Date.now()`   |
| Invalid cookie in `POST /auth/refresh`  | The value is passed with attributes (`; HttpOnly; …`) | `.split(';')[0]` when extracting from `set-cookie` |
