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
| `apps/api/` — NestJS, Clean Architecture, TypeOrm | [apps/api/AGENTS.md](apps/api/AGENTS.md)                 |
| `apps/client/` — React, TanStack Query, Zustand   | [apps/client/AGENTS.md](apps/client/AGENTS.md)           |

---

## Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action                                                | Skill           |
| ----------------------------------------------------- | --------------- |
| Creating a branch, opening a PR, or merging code      | `git-workflow`  |
| Before implementing any new feature, use case, hook or component | `tdd-workflow` |
| Starting a new project or aligning an existing one   | `project-bootstrap` |
| Building a feature or behavior change                | `factory-workflow` |

---

## Available Skills

| Skill                | Scope  | Description                                                      |
| -------------------- | ------ | ---------------------------------------------------------------- |
| `tdd-workflow`       | global | Workflow TDD obligatorio: Red→Green→Refactor antes de cualquier código nuevo |
| `project-bootstrap`  | global | Instala AGENTS.md, docs de arquitectura y guías de scaffold       |
| `factory-workflow`   | global | Coordina los agentes por rol hasta la aprobación final            |
| `skill-creator`      | global | Crea nuevas skills siguiendo el spec del repo                    |
| `skill-sync`         | global | Sincroniza skills a las tablas de AGENTS.md                      |
| `git-workflow`       | global | Branching, naming, merge strategy y PRs para este repo           |
| `api-domain`         | api    | AggregateRoot, Value Objects, Repository interface, DomainErrors |
| `api-application`    | api    | Use Cases, Domain Services, convenciones de inyección            |
| `api-infrastructure` | api    | Controllers, TypeORM entities, repositorios, módulos NestJS      |
| `api-domain-events`  | api    | Domain Events — definición, naming, registro en aggregates       |
| `api-testing`        | api    | Pirámide de tests, Object Mother, jest-mock-extended             |
| `api-criteria`       | api    | Criteria — filtros, orden, paginación, flujo controller→uc→repo  |
| `api-error-handler`  | api    | GlobalExceptionRegistry, filtros por módulo, HttpExceptionFilter |
| `api-rest`           | api    | Convenciones RESTful + acciones DDD con POST                     |
| `api-bc-review`      | api    | Auditoría DDD de bounded contexts: límites, submódulos, checklist |
| `api-auth`           | api    | JWT, OAuth Google, guest token, guards, @CurrentUser, voters     |
| `api-shared`         | api    | SharedModule global, bounded context shared, env validation Joi  |
| `api-events`         | api    | EventBus interface, DomainEventConsumer, Handler abstract        |
| `api-events-infra`   | api    | AmqpMessageBus, HandlersBootstrapper, retry, DLQ, idempotencia   |
| `api-di`             | api    | Tokens Symbol, registro de providers, inyección sin acoplamiento |
| `api-migrations`     | api    | TypeORM migrations formato, seeds idempotentes                   |
| `api-response`       | api    | Envelope de respuesta, paginación, commands sin body             |
| `api-validation`     | api    | ValidationPipe global, Payload/Query con class-validator         |
| `api-observability`  | api    | Logger interface, pino, métricas Prometheus, OTel traces         |
| `client-pods`                    | client | Estructura de pods, naming, cuándo crear qué                     |
| `client-container-presentational`| client | Contrato Container/Component, responsabilidades, prohibiciones   |
| `client-query`                   | client | TanStack Query: queries, mutations, query keys, invalidación     |
| `client-api`                     | client | Capa api/: api-model, api.ts, mapper, ViewModel types            |
| `client-hooks`                   | client | Hooks del pod [State, Handlers], hooks globales, cuándo extraer  |
| `client-testing`                 | client | Vitest + RTL (unit/integration), Playwright E2E, MSW             |

---

## Project Structure

```
{{PROJECT_NAME}}/
├── apps/
│   ├── api/          ← NestJS backend (Clean Architecture)
│   └── client/       ← React frontend
├── .agents/skills/   ← Skills de abraham-harness, generadas por npx skills (o .claude/skills). No editar
├── docs/             ← Documentación del proyecto
├── infra/            ← Docker Compose, observabilidad
└── AGENTS.md         ← Este archivo
```

---

## Stack

| Layer          | Tech                                                               |
| -------------- | ------------------------------------------------------------------ |
| Frontend       | React, TypeScript, Vite, TailwindCSS, TanStack Query, Zustand, Zod |
| Backend        | NestJS, TypeScript, TypeORM, Class Validator                       |
| Database       | PostgreSQL                                                 |
| Testing        | Vitest, Jest, Playwright                                           |
| Observabilidad | OpenTelemetry, Prometheus, Grafana, Loki                           |
| Infra          | Docker, GitHub Actions |

---

## Monorepo-wide Code Style

- **TypeScript** estricto en todos los paquetes — no usar `any`
- **Zod and Class Validator** para validación cliente-servidor`
- **Conventional Commits**: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`, `ci`, `revert`
- **ESLint + Prettier** — no commitear código sin pasar linting — enforced por Husky
- **Imports**: usar path aliases, nunca rutas relativas largas

---

## Git Hooks (Husky)

Configurados en `.husky/` a nivel raíz del monorepo.

| Hook | Herramienta | Qué hace |
| ------------- | ----------- | ------------------------------------------------------------ |
| `pre-commit`  | lint-staged | ESLint --fix + Prettier --write sobre archivos staged únicamente |
| `commit-msg`  | commitlint  | Valida que el mensaje siga Conventional Commits              |

**lint-staged** corre eslint y prettier **solo sobre los archivos staged** — no sobre todo el proyecto. Rápido, < 2s.

**tsc --noEmit** NO está en pre-commit — va en CI. El ESLint con `recommendedTypeChecked` cubre type-safety por archivo.

**Tipos válidos en commit-msg:** `feat` | `fix` | `docs` | `chore` | `refactor` | `test` | `perf` | `ci` | `revert`

Config commitlint: `commitlint.config.ts` en la raíz.

---

## Scripts raíz (monorepo)

Desde la raíz del monorepo, estos scripts propagan el comando a todos los workspaces:

```bash
pnpm lint          # ESLint en api + client
pnpm test          # Unit tests en api + client
pnpm test:e2e      # E2E tests en api + client
pnpm test:all      # Unit + E2E en api + client
pnpm test:ci       # Tests + coverage en modo CI (GitHub Actions)
```

> Para correr solo en un workspace: `pnpm --filter @{{PROJECT_NAME}}/api test`

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

- Toda la documentación en Markdown dentro de `docs/`
- Diagramas con **Mermaid** embebido en `.md` — sin imágenes externas
- ADRs en `docs/adr/` para decisiones arquitectónicas importantes
