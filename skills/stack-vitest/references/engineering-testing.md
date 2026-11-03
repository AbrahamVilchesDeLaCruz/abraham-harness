# Vitest — testing.md in engineering-conventions and the project rules

Vitest details for the concepts in `testing.md` in `engineering-conventions`, and in the `AGENTS.md` of each app.

## API

The NestJS template brings Vitest: keep its scripts and configuration. Tests resolve DI with `@nestjs/testing` with no extra decorator configuration.

### Test pyramid

```
         ┌─────────────────┐
         │      E2E        │  ← supertest against the real NestJS app + Docker Postgres
         ├─────────────────┤
         │  Integration    │  ← (does not apply yet — E2E covers this level)
         ├─────────────────┤
         │      Unit       │  ← use cases with vitest-mock-extended, which exercise the domain
         └─────────────────┘
```

### Unit tests

Application tests are Use Cases, with repository mocks from `vitest-mock-extended`. `src/{bc}/{module}/application/{action}/{use-case}.ts` is tested in `test/{bc}/{module}/application/{action}/`, with `request-{use-case}.mother.ts` and `{use-case}.spec.ts`.

- Config: `apps/api/vitest.config.ts`, from the template.
- Pattern: the template's `include` is `**/*.spec.ts`. It matches a spec in any folder, so placing specs under `test/` is the project's rule, not something the configuration enforces. It does not match `*.e2e-spec.ts`.
- Aliases: the template sets `resolve: { tsconfigPaths: true }`, so `@/` and `@test/` work once they are in `tsconfig.json`.
- Mocks via `vitest-mock-extended` — no manual `vi.fn()` for typed ports.
- `describe`, `it`, `expect`, `beforeEach` and `vi` are **globals** — do not import them from `vitest`.

### E2E tests

- Config: `apps/api/vitest.config.e2e.ts`, from the template.
- Pattern: `**/*.e2e-spec.ts`.
- E2E tests run **in series**, not in parallel, because they share the same DB. Add `fileParallelism: false` to the `test` block of this config.
- The vars are loaded automatically from `apps/api/.env.test` via `test/setup-env.ts`: add `setupFiles: ['./test/setup-env.ts']` to the same block.

### Test file structure

```
apps/api/
├── vitest.config.ts            ← config for unit tests
├── vitest.config.e2e.ts        ← config for E2E tests
├── .env.test                   ← environment vars for E2E (committed)
└── test/
    ├── setup-env.ts            ← loads .env.test before the NestJS bootstrap
    ├── shared/
    │   ├── domain/             ← base shared Object Mothers (MotherCreator, UuidMother…)
    │   └── infrastructure/
    │       └── create-test-app.ts  ← helper: bootstraps NestJS for E2E
    └── identity/
        ├── user/application/register/  ← request-user-registrar.mother.ts + user-registrar.spec.ts
        └── infrastructure/     ← E2E specs
            ├── guest-auth-post.e2e-spec.ts
            ├── register-login-auth.e2e-spec.ts
            ├── refresh-logout-auth.e2e-spec.ts
            └── guards.e2e-spec.ts
```

### Project commands

- `pnpm test` runs `vitest run`.
- `pnpm test:watch` runs Vitest in watch mode.
- `pnpm test:cov` runs Vitest + coverage.
- `pnpm test:debug` runs Vitest with the Node inspector.
- `pnpm test:e2e` runs `vitest run --config ./vitest.config.e2e.ts`.

## Client

The Vite template brings no test runner, so Vitest is added on top of it.

**Vitest config:** `vitest.config.ts` — intentionally separate from `vite.config.ts`.
**Setup:** `src/test/setup.ts` — imports `@testing-library/jest-dom`.

Project commands with these tools:

- `pnpm test` runs Vitest once.
- `pnpm test:cov` runs Vitest + coverage.
- `pnpm test:ui` opens the Vitest UI in the browser (interactive visualization).
- `pnpm test:e2e` runs Playwright (requires prior installation).
- `pnpm test:e2e:ui` runs Playwright with its interactive UI.
- `pnpm test:ci` runs Vitest + coverage + verbose (GitHub Actions).
- `pnpm test:e2e:ci` runs Playwright `--reporter=github` (GitHub Actions).

`client-testing` covers Vitest + RTL (unit/integration), Playwright E2E and MSW.
