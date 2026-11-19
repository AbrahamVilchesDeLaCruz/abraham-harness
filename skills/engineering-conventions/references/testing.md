# Testing

> How tests actually run in this monorepo.
> Runner configuration and framework details: read `references/engineering-testing.md` in the stack skills that match this project's stack table.

---

## Test policy

Two levels in the api, and no integration level:

```
         ┌─────────────────┐
         │      E2E        │  ← controllers only: real HTTP + the test database
         ├─────────────────┤
         │      Unit       │  ← everything else, tested from the application layer
         └─────────────────┘
```

- **Unit** is the large layer. Every behavior is tested from `application`: use cases with mocked ports, which exercise the domain.
- **Event subscribers live in application**, so they are unit tests too: build the domain event with an Object Mother and call the subscriber. The message bus is never started.
- **E2E covers controllers only**: the HTTP contract, guards, validation and persistence through the real repositories.
- **There are no integration tests.** A repository is exercised only through the controller E2E that uses it.

---

## Unit tests (`*.spec.ts`)

### What do they cover?

- Application: Use Cases and Subscribers, with mocked ports and Object Mothers. The domain is always tested through them.
- Domain: only a larger Domain Service you want to test on its own. Aggregates and Value Objects have no tests of their own.

### How to run them

Unit tests have no I/O. While developing they run directly on the host, which is the fast loop. Run affected modules and their seams at intermediate phase integration. Under the shared default, run the complete unit suite locally once for the final candidate of the whole feature or a separately gated phase. A project verification policy that reserves complete suites for CI overrides that local default; keep local checks focused. In CI, API unit tests run inside the same compose run as the E2E tests (see below).

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

- One `*.spec.ts` file per use case or subscriber. Specs live under `test/`, never under `src/`
- `src/{bc}/{module}/application/{action}/{use-case}.ts` is tested in `test/{bc}/{module}/application/{action}/`, which holds `request-{use-case}.mother.ts` and `{use-case}.spec.ts`
- Object Mother for fixtures: next to the spec; shared Mothers go in `test/shared`
- Mocks through the project's mocking library: no manual mock functions

---

## E2E tests (`*.e2e-spec.ts`)

### What do they cover?

The real HTTP contract of the controllers: starts the complete application against the test database and makes real HTTP requests. They validate that controllers, guards, use cases and repositories work end to end. One file per controller or endpoint group; the business rules stay in unit tests.

### How they run: Dockerfile + `docker-compose.test.yml`

API E2E tests always run inside containers, so every machine and CI run uses the same environment. In CI the same compose run also executes the API unit tests, in one iteration.

- `Dockerfile` has a test target that installs dependencies. Its runner executes the unit command and then the E2E command.
- `docker-compose.test.yml` at the monorepo root defines two services: the test database and the test runner built from that Dockerfile target. The runner waits for the database healthcheck.
- **One database for all suites.** It starts once, before the first test, and every suite shares it. The compose run starts it, runs the tests and stops it.

```bash
# The target belongs in make/project.mk
make test-e2e
# delegates to the root package.json test:e2e script
```

The shared Makefile calls the root `test:e2e` script; that script orchestrates `docker compose -f docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from api-test` for the API, plus complete client unit and browser suites when present. Provide the browser suite's own test services for its run: the API test Compose services stop when `api-test` exits. The API package `test:e2e` script only runs its E2E test runner inside Compose. Do not call the root script from that runner, and do not add a second `test-e2e` Make target. The shared Makefile has no separate target for the test database; a project-specific database target belongs in `make/project.mk`.

#### In CI

CI must run the complete unit and E2E suite on the candidate branch or PR as a publication check before merge or deployment, unless the project's CI policy defines a stricter gate. For the API, use the same compose file, so unit and E2E tests run in one iteration and there is no separate database service to keep in sync. Include client E2E when the project has a client. Locally, run focused unit tests while iterating; the project policy decides whether a final local full-unit run is required. Routine E2E runs in CI; use `make test-e2e` locally only when the project permits it to diagnose a CI failure or concrete integration risk.

**The secrets manager is not used in the E2E step**: the vars come from the committed `.env.test` (it contains only test values, no real secrets).

### Environment variables for E2E tests

The vars are loaded automatically from `apps/api/.env.test` via `test/setup-env.ts`, registered in the E2E runner config. Inside compose, the database host is the service name, not `localhost`.

```bash
# apps/api/.env.test (committed — no secrets)
NODE_ENV=test
DATABASE_URL=postgres://test:test@db:5432/myapp_test
JWT_SECRET=test-jwt-secret-at-least-32-chars-long
JWT_REFRESH_SECRET=test-jwt-refresh-secret-at-least-32-chars
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=30d
FRONTEND_URL=http://localhost:5173
```

### Test Docker Compose

`docker-compose.test.yml` at the monorepo root:

- **Database image**: `postgres:<version>-alpine`
- **Storage**: `tmpfs` — ephemeral, destroyed when the container stops
- **Healthcheck**: `pg_isready`; the runner starts only when it is healthy
- **Runner**: built from the Dockerfile test target

### Migrations in E2E

Migrations run **only once** when the test database starts. The database is ephemeral (tmpfs): stopping it destroys it, and the next run applies the schema again.

### E2E execution

- The E2E tests run **in series**, not in parallel (they share the same database)

### E2E conventions

- One `*.e2e-spec.ts` file per controller or functionality (e.g. `register-login-auth.e2e-spec.ts`)
- The `createTestApp()` helper in `test/shared/infrastructure/create-test-app.ts` centralizes the bootstrap of the test app
- One app per file: all tests in a file share the app, created once in `beforeAll` and closed in `afterAll`. Never boot it per test. Keep in-memory state (caches, rate limiters) out of the app under test, or reset it in `afterEach`
- Data cleanup: each suite deletes its own records in `afterEach` / `afterAll`
- Unique emails and nicknames per suite via `Date.now()`: avoids collisions between suites on the shared database
- Cookie extraction: `res.headers['set-cookie'][0].split(';')[0]` — the `Cookie` header only accepts `key=value`

---

## Quick reference commands

| Command                               | What it does                          |
| ------------------------------------- | ------------------------------------- |
| `pnpm test`                           | Unit tests in all workspaces          |
| `pnpm --filter @myapp/api test`       | Unit tests API only                   |
| `pnpm --filter @myapp/api test:cov`   | Unit tests + coverage                 |
| `pnpm --filter @myapp/api test:watch` | Unit tests in watch mode              |
| `make test-e2e`                       | CI full-test command; local diagnostic when needed: API Compose and client journeys |
| `pnpm --filter @myapp/api test:e2e`   | E2E command that the compose runner executes after the unit command |
| `make local` / `make local-down`      | Local development stack, not used by the tests |

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
    │   ├── domain/             ← base shared Object Mothers (MotherCreator, UuidMother…)
    │   └── infrastructure/
    │       └── create-test-app.ts  ← helper: bootstraps the application for E2E
    └── identity/
        ├── user/application/register/  ← request-user-registrar.mother.ts + user-registrar.spec.ts
        └── infrastructure/     ← E2E specs
            ├── guest-auth-post.e2e-spec.ts
            ├── register-login-auth.e2e-spec.ts
            ├── refresh-logout-auth.e2e-spec.ts
            └── guards.e2e-spec.ts
```

---

## Coverage

Coverage is generated with `pnpm test:cov`, and written where the test runner's configuration says.

In CI, coverage is collected for the report but **there is no minimum threshold** configured: the goal is visibility, not blocking the merge.

---

## Known gotchas

| Problem                                 | Cause                                               | Solution                                       |
| --------------------------------------- | --------------------------------------------------- | ---------------------------------------------- |
| `connect ECONNREFUSED`                  | E2E run outside the compose test environment        | Run `make test-e2e`, or the project's compose test target |
| `SSL required` in E2E                   | The persistence layer uses SSL outside test mode    | Disable SSL when `NODE_ENV=test`               |
| `422` instead of `400` on validation    | The validation layer is configured to answer 422    | Expected: use 422 in the specs                 |
| E2E tests interfere with each other     | Shared data in the DB                               | Use unique emails/nicknames via `Date.now()` and clean up what the suite creates |
| Invalid cookie in `POST /auth/refresh`  | The value is passed with attributes (`; HttpOnly; …`) | `.split(';')[0]` when extracting from `set-cookie` |
