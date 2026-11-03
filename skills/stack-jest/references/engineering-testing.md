# Jest — docs/engineering/testing.md

Jest details for the concepts in `docs/engineering/testing.md`.

## Test pyramid

```
         ┌─────────────────┐
         │      E2E        │  ← supertest against the real NestJS app + Docker Postgres
         ├─────────────────┤
         │  Integration    │  ← (does not apply yet — E2E covers this level)
         ├─────────────────┤
         │      Unit       │  ← use cases with jest-mock-extended, which exercise the domain
         └─────────────────┘
```

## Unit tests

Application tests are Use Cases, with repository mocks from `jest-mock-extended`.

### Runner

- **Jest** with `ts-jest`
- Config: `apps/api/jest.config.ts`
- Pattern: `test/**/*.spec.ts`
- `NODE_OPTIONS=--experimental-vm-modules` — required for ESM with `jest-mock-extended`

### Conventions

- Mocks via `jest-mock-extended` — no manual `jest.fn()`
- `describe`, `it`, `expect`, `beforeEach` are **globals** — do not import them from `@jest/globals`

## E2E tests

### Environment variables

The vars are loaded automatically from `apps/api/.env.test` via `test/setup-env.ts` (registered in `jest.e2e.config.ts` under `setupFiles`).

### E2E runner

- **Jest** with `ts-jest`
- Config: `apps/api/jest.e2e.config.ts`
- Pattern: `test/**/*.e2e-spec.ts`
- `--runInBand` flag — E2E tests run **in series**, not in parallel (they share the same DB)
- `NODE_OPTIONS=--experimental-vm-modules`

## Test file structure

```
apps/api/
├── jest.config.ts              ← config for unit tests
├── jest.e2e.config.ts          ← config for E2E tests
├── .env.test                   ← environment vars for E2E (committed)
└── test/
    ├── setup-env.ts            ← loads .env.test before the NestJS bootstrap
    ├── shared/
    │   ├── domain/             ← base shared Object Mothers (MotherCreator, UuidMother…)
    │   └── infrastructure/
    │       └── create-test-app.ts  ← helper: bootstraps NestJS for E2E
    └── identity/
        ├── application/        ← unit specs + the Object Mothers next to them
        └── infrastructure/     ← E2E specs
            ├── guest-auth-post.e2e-spec.ts
            ├── register-login-auth.e2e-spec.ts
            ├── refresh-logout-auth.e2e-spec.ts
            └── guards.e2e-spec.ts
```

## Project commands

- `pnpm test:debug` runs Jest with the Node inspector.

**Jest configs:**
- `jest.config.ts` — unit tests (`src/**/*.spec.ts`)
- `jest.e2e.config.ts` — E2E tests (`test/**/*.e2e-spec.ts`)
