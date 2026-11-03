# API Agent — {{PROJECT_NAME}}

> **Scope**: All the code in `apps/api/`. For other scopes, go back to the orchestrator: [../../AGENTS.md](../../AGENTS.md)

---

<!-- abraham-harness:auto-invoke:start -->
## Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action | Skill |
|---|---|
| Create or modify aggregates, value objects, repositories, domain errors | `api-domain` |
| Create or modify use cases or domain services | `api-application` |
| Create or modify controllers, persistence entities, repositories, modules | `api-infrastructure` |
| Create or modify domain events, record events in aggregates | `api-domain-events` |
| Create or modify tests, Object Mothers, port mocks | `api-testing` |
| Build queries with filters, ordering or pagination | `api-criteria` |
| Create domain errors or register exceptions in a module | `api-error-handler` |
| Design or implement REST endpoints or DDD actions | `api-rest` |
| Audit or refactor a bounded context (boundaries, submodules, debt) | `api-bc-review` |
| Implement auth, guards, strategies, the current-user parameter, voters | `api-auth` |
| Create or modify the shared module, internal shared, env validation | `api-shared` |
| Define or implement EventBus, DomainEventConsumer, abstract Handler | `api-events` |
| Implement the message bus, HandlersBootstrapper, retry, DLQ | `api-events-infra` |
| Define DI tokens, register providers, inject interfaces | `api-di` |
| Create database migrations or seeds | `api-migrations` |
| Define the HTTP response format, envelope, pagination | `api-response` |
| Configure request validation, Payload, Query | `api-validation` |
| Configure logging, metrics, traces and their tooling | `api-observability` |

After a concept skill, load the stack skill that matches this project's stack table, and read its `references/{concept-skill}.md`.
<!-- abraham-harness:auto-invoke:end -->

---

## Architecture

Clean Architecture with Screaming Architecture per feature:

```
apps/api/src/
├── {feature}/
│   ├── domain/           ← aggregates, value objects, domain services, repository interfaces, domain errors
│   ├── application/      ← use cases
│   └── infrastructure/
│       ├── controllers/  ← one controller per action + payload/query next to it
│       ├── framework/    ← framework modules + exception registries
│       └── persistence/  ← persistence entities + repositories
├── shared/               ← AggregateRoot, ValueObject, DomainError, Criteria base classes
└── main.ts
```

**Golden rule**: dependencies point inward. `infrastructure` depends on `application`, `application` depends on `domain`. Never the reverse.

### DDD modules inside a Bounded Context

When a BC has **multiple aggregates**, it is organized into DDD modules (Vaughn Vernon, IDDD). It works almost as a modular monolith:

```
apps/api/src/{bc}/
├── {module-a}/           ← owner of aggregate A
│   ├── domain/
│   ├── application/
│   └── infrastructure/
│       ├── controllers/
│       ├── framework/    ← framework module of the module, its exception registry, wiring
│       └── persistence/
├── {module-b}/           ← owner of aggregate B
│   ├── domain/
│   ├── application/
│   └── infrastructure/
│       ├── controllers/
│       ├── framework/    ← framework module of the module, its exception registry, wiring
│       └── persistence/
└── shared/               ← what crosses modules inside the BC
    ├── domain/           ← VOs or interfaces shared between modules
    └── infrastructure/
        ├── framework/    ← shared module of the BC: gathers the modules and their registries
        └── persistence/  ← shared stubs or repos
```

**Rules:**
- If a BC has submodules, **there cannot be loose layers (`domain/`, `application/`, `infrastructure/`) at the root of the BC**: everything goes in submodules or in `shared/`
- One module = one aggregate or cohesive concept (not just any entity)
- `shared/` inside the BC is only for what crosses modules; the shared module of the BC goes in `shared/infrastructure/framework/`
- Each module exports its own exception registry. The shared module of the BC gathers them, and it is what reaches the root shared module, which never receives a module directly
- Tests mirror the same structure: `test/{bc}/{module}/`. A use case test is a unit test: `src/{bc}/{module}/application/{action}/{use-case}.ts` is tested in `test/{bc}/{module}/application/{action}/`, with `request-{use-case}.mother.ts` and `{use-case}.spec.ts`

---

## Stack table

Fill in this list with this project's stack. The values shown are the default suggestion.

- Main framework: NestJS + TypeScript (`stack-nestjs`)
- ORM, only in `infrastructure/`: TypeORM (`stack-typeorm`)
- HTTP payload validation in controllers: Class Validator (`stack-nestjs`)
- Database: PostgreSQL
- Testing: Jest + Faker.js + jest-mock-extended (`stack-jest`)
- API contract: OpenAPI / Swagger (`stack-nestjs`)
- Message bus: RabbitMQ (`stack-rabbitmq`)
- Logs, metrics, traces: Pino, Prometheus, OpenTelemetry (`stack-observability`)

---

## Code Rules

- Strict **TypeScript**: do not use `any`
- The **ORM** only in `infrastructure/persistence/`: never in domain or application
- Domain errors as typed classes: `throw new ProductNotFound(id)`
- External services only in `infrastructure/`, interfaces in `domain/`
- Path aliases in all imports: never long relative paths

---

## Commands

```bash
# From apps/api/
pnpm start:dev        # Dev server with hot-reload
pnpm lint             # ESLint --fix on src/ and test/

# ─── Unit tests ───────────────────────────────────────────────────────────────
pnpm test             # Unit tests (passes if there are no tests yet)
pnpm test:watch       # TDD loop — re-run on change
pnpm test:cov         # Unit tests + coverage → coverage/unit/

# ─── E2E tests ────────────────────────────────────────────────────────────────
pnpm test:e2e         # E2E tests (requires the DB running: make up)
pnpm test:e2e:watch   # E2E in watch mode
pnpm test:e2e:cov     # E2E + coverage → coverage/e2e/

# ─── All ──────────────────────────────────────────────────────────────────────
pnpm test:all         # Unit + E2E sequentially

# ─── CI ───────────────────────────────────────────────────────────────────────
pnpm test:ci          # Unit + coverage --ci --forceExit (GitHub Actions)
pnpm test:e2e:ci      # E2E + coverage --ci --forceExit (GitHub Actions)

# ─── Debug ────────────────────────────────────────────────────────────────────
pnpm test:debug       # Test runner with the Node inspector
```

**Test runner configs:**
- Unit tests (`test/**/*.spec.ts`)
- E2E tests (`test/**/*.e2e-spec.ts`)

**Coverage thresholds (unit):** 90% branches / 100% functions / 100% lines / 100% statements

---

<!-- abraham-harness:available-skills:start -->
## Available Skills

| Skill | Scope | Description |
|---|---|---|
| `api-domain`           | api    | AggregateRoot, Value Objects, Repository interface, DomainErrors |
| `api-application`      | api    | Use Cases, Domain Services, injection conventions                |
| `api-infrastructure`   | api    | Controllers, persistence entities, repositories, framework modules |
| `api-domain-events`    | api    | Domain Events: definition, naming, recording in aggregates       |
| `api-testing`          | api    | Test pyramid, Object Mother, port mocks                          |
| `api-criteria`         | api    | Criteria: filters, ordering, pagination, controller→uc→repo flow |
| `api-error-handler`    | api    | GlobalExceptionRegistry, per-module filters, HttpExceptionFilter |
| `api-rest`             | api    | RESTful conventions + DDD actions with POST                      |
| `api-bc-review`        | api    | DDD audit of bounded contexts: boundaries, submodules, checklist |
| `api-auth`             | api    | JWT, OAuth Google, guest token, guards, the current-user parameter, voters     |
| `api-shared`           | api    | Global the shared module, bounded context shared, env validation      |
| `api-events`           | api    | EventBus interface, DomainEventConsumer, abstract Handler        |
| `api-events-infra`     | api    | Message bus, HandlersBootstrapper, retry, DLQ, idempotency       |
| `api-di`               | api    | Symbol tokens, provider registration, injection without coupling |
| `api-migrations`       | api    | Migration format, idempotent seeds                               |
| `api-response`         | api    | Response envelope, pagination, commands with no body             |
| `api-validation`       | api    | Global request validation, Payload/Query                         |
| `api-observability`    | api    | Logger interface, structured logs, metrics, traces               |
| `stack-nestjs`         | api    | Maps the concept skills to NestJS                                |
| `stack-typeorm`        | api    | Maps the concept skills to TypeORM                               |
| `stack-jest`           | api    | Maps the concept skills to Jest                                  |
| `stack-rabbitmq`       | api    | Maps the concept skills to RabbitMQ                              |
| `stack-observability`  | api    | Maps the concept skills to Pino, Prometheus and OpenTelemetry    |
<!-- abraham-harness:available-skills:end -->

---

## Project Skills

Skills that exist only in this project. `skill-sync` keeps this table current. `update` refreshes the tables between the `abraham-harness` markers, and never changes this one.

| Skill | Description |
| --- | --- |
