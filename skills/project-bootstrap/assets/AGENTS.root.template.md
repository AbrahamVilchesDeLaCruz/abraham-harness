# {{PROJECT_NAME}} — AI Orchestrator

> {{PROJECT_DESCRIPTION}}

## Role of This File

This is the **monorepo orchestrator**. Its job is to:

1. Route work to the correct scope based on which app is being modified.
2. Auto-invoke the correct skill before starting any action that has a known pattern.
3. Provide monorepo-wide conventions that apply to every scope.

Load the scope `AGENTS.md` as soon as you know which app you are working in. Do not work from this file alone for scope-specific tasks.

---

## Sub-Agent Routing

| If the work is in...                              | Load this agent                                          |
| ------------------------------------------------- | -------------------------------------------------------- |
| `apps/api/` — Backend, Clean Architecture         | [apps/api/AGENTS.md](apps/api/AGENTS.md)                 |
| `apps/client/` — Frontend, Pods                   | [apps/client/AGENTS.md](apps/client/AGENTS.md)           |

---

## Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action                                                | Skill           |
| ----------------------------------------------------- | --------------- |
| Creating a branch, opening a PR, or merging code      | `git-workflow`  |
| Before implementing any new feature, use case, hook or component | `tdd-workflow` |
| Starting a new project or aligning an existing one   | `project-bootstrap` |
| Every request: pick the lane and coordinate the agents | `factory-workflow` |
| Planning a task, or implementing one plan phase      | `plan-create`, `plan-phase-implement` |

After a concept skill, load the stack skill that matches this project's stack table, and read its `references/{concept-skill}.md`.

---

## Available Skills

| Skill                | Scope  | Description                                                      |
| -------------------- | ------ | ---------------------------------------------------------------- |
| `tdd-workflow`       | global | Mandatory TDD workflow: Red→Green→Refactor before any new code   |
| `project-bootstrap`  | global | Installs AGENTS.md, architecture docs and scaffold guides        |
| `factory-workflow`   | global | Picks the lane (Answer, FTD or SDD) and coordinates the agents   |
| `plan-create`        | global | Phased plan with agreed public contracts                         |
| `plan-phase-implement` | global | Implements one single phase and stops, without committing      |
| `skill-creator`      | global | Creates new skills following the repo spec                       |
| `skill-sync`         | global | Syncs skills to the AGENTS.md tables                             |
| `git-workflow`       | global | Branching, naming, merge strategy and PRs for this repo          |
| `api-domain`         | api    | AggregateRoot, Value Objects, Repository interface, DomainErrors |
| `api-application`    | api    | Use Cases, Domain Services, injection conventions                |
| `api-infrastructure` | api    | Controllers, persistence entities, repositories, framework modules |
| `api-domain-events`  | api    | Domain Events: definition, naming, recording in aggregates       |
| `api-testing`        | api    | Test pyramid, Object Mother, port mocks                          |
| `api-criteria`       | api    | Criteria: filters, ordering, pagination, controller→uc→repo flow |
| `api-error-handler`  | api    | GlobalExceptionRegistry, per-module filters, HttpExceptionFilter |
| `api-rest`           | api    | RESTful conventions + DDD actions with POST                      |
| `api-bc-review`      | api    | DDD audit of bounded contexts: boundaries, submodules, checklist |
| `api-auth`           | api    | JWT, OAuth Google, guest token, guards, the current-user parameter, voters     |
| `api-shared`         | api    | Global the shared module, bounded context shared, env validation      |
| `api-events`         | api    | EventBus interface, DomainEventConsumer, abstract Handler        |
| `api-events-infra`   | api    | Message bus, HandlersBootstrapper, retry, DLQ, idempotency       |
| `api-di`             | api    | Symbol tokens, provider registration, injection without coupling |
| `api-migrations`     | api    | Migration format, idempotent seeds                               |
| `api-response`       | api    | Response envelope, pagination, commands with no body             |
| `api-validation`     | api    | Global request validation, Payload/Query                         |
| `api-observability`  | api    | Logger interface, structured logs, metrics, traces               |
| `client-pods`                    | client | Pod structure, naming, when to create what                       |
| `client-container-presentational`| client | Container/Component contract, responsibilities, prohibitions     |
| `client-query`                   | client | Server state: queries, mutations, query keys, invalidation       |
| `client-api`                     | client | api/ layer: api-model, api.ts; pod-root repository, mapper and ViewModel types |
| `client-hooks`                   | client | Pod hooks with named fields, global hooks, when to extract       |
| `client-testing`                 | client | Unit/integration tests, E2E, API mocks                           |
| `stack-nestjs`        | api    | Maps the concept skills to NestJS                                |
| `stack-typeorm`       | api    | Maps the concept skills to TypeORM                               |
| `stack-jest`          | api    | Maps the concept skills to Jest                                  |
| `stack-rabbitmq`      | api    | Maps the concept skills to RabbitMQ                              |
| `stack-observability` | api    | Maps the concept skills to Pino, Prometheus and OpenTelemetry    |
| `stack-react`         | client | Maps the concept skills to React                                 |
| `stack-tanstack-query`| client | Maps the concept skills to TanStack Query                        |
| `stack-vitest`        | client | Maps the concept skills to Vitest, Testing Library, MSW and Playwright |

---

## Project Structure

```
{{PROJECT_NAME}}/
├── apps/
│   ├── api/          ← Backend (Clean Architecture)
│   └── client/       ← Frontend
├── .agents/skills/   ← Skills from abraham-harness, generated by npx skills (or .claude/skills). Do not edit
├── docs/             ← Project documentation
├── infra/            ← Docker Compose, observability
└── AGENTS.md         ← This file
```

---

## Stack table

Fill in this list with this project's stack. The values shown are the default suggestion.

- Frontend: React, TypeScript, Vite, TailwindCSS, TanStack Query, Zustand, Zod (`stack-react`, `stack-tanstack-query`)
- Backend: NestJS, TypeScript, TypeORM, Class Validator (`stack-nestjs`, `stack-typeorm`)
- Database: PostgreSQL
- Message bus: RabbitMQ (`stack-rabbitmq`)
- Testing: Vitest, Jest, Playwright (`stack-vitest`, `stack-jest`)
- Observability: OpenTelemetry, Prometheus, Grafana, Loki (`stack-observability`)
- Infra: Docker, GitHub Actions

---

## Monorepo-wide Code Style

- Strict **TypeScript** in all packages: do not use `any`
- **Schema validators** for client-server validation
- **Conventional Commits**: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`, `ci`, `revert`
- **ESLint + Prettier**: do not commit code without passing linting, enforced by Husky
- **Imports**: use path aliases, never long relative paths

---

## Git Hooks (Husky)

Configured in `.husky/` at the monorepo root.

| Hook | Tool | What it does |
| ------------- | ----------- | ------------------------------------------------------------ |
| `pre-commit`  | lint-staged | ESLint --fix + Prettier --write on staged files only         |
| `commit-msg`  | commitlint  | Validates that the message follows Conventional Commits      |

**lint-staged** runs eslint and prettier **only on the staged files**, not on the whole project. Fast, < 2s.

**tsc --noEmit** is NOT in pre-commit: it goes in CI. ESLint with `recommendedTypeChecked` covers per-file type safety.

**Valid types in commit-msg:** `feat` | `fix` | `docs` | `chore` | `refactor` | `test` | `perf` | `ci` | `revert`

commitlint config: `commitlint.config.ts` at the root.

---

## Root scripts (monorepo)

From the monorepo root, these scripts propagate the command to all workspaces:

```bash
pnpm lint          # ESLint in api + client
pnpm test          # Unit tests in api + client
pnpm test:e2e      # E2E tests in api + client
pnpm test:all      # Unit + E2E in api + client
pnpm test:ci       # Tests + coverage in CI mode (GitHub Actions)
```

> To run in only one workspace: `pnpm --filter @{{PROJECT_NAME}}/api test`

---

## Commit Guidelines

```
feat(products): add discount rules
fix(orders): handle payment timeout gracefully
refactor(reviews): extract scoring to domain service
test(products): add unit tests for price calculator
```

---

## Documentation & Diagrams

- All documentation in Markdown inside `docs/`
- Diagrams with embedded **Mermaid** in `.md`, no external images
- ADRs in `docs/adr/` for important architecture decisions
