---
name: api-shared
description: "Trigger: When creating or modifying SharedModule, adding environment variable validation, or cross-cutting infrastructure. Global SharedModule, shared bounded context, env validation in apps/api/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.1"
---


## Activation Contract

- When creating or modifying the global `SharedModule` module
- When creating an internal shared of a bounded context
- When adding environment variable validation
- When registering cross-cutting infrastructure (logger, event bus, global filters)

## Hard Rules

### Modules

- `SharedModule` is imported **only once** in `AppModule` — it is global
- The config module and the persistence root connection are configured in **`AppModule`**, not in `SharedModule`.
- The config module is declared global so the config service is available in all modules
- Persistence is configured through a builder function that parses `DATABASE_URL`
- `SharedModule` does not import or re-export the config module or the persistence module
- Bounded context modules **are not global** — they are imported explicitly in `AppModule`
- BC modules export only what other BCs need (repository tokens or domain services)
- Automatic schema synchronization is off **always** — migrations are the source of truth of the schema

### Env

- Abort-early off always — see all errors at once
- Required in everything that has no default — fails at bootstrap, not at runtime
- Env validation uses the schema library the stack skill names — do not pick another one
- Configuration lives in the config module **in `AppModule`**, not in `SharedModule`
- Env validation fails at bootstrap — if a variable is missing, the app does not start

### Criteria + persistence

- The Criteria pattern is applied **directly in each repository** with a query builder — there is no shared converter. Each repository applies its own filters because it can have different relations and aliases.
- See the canonical implementation in skill `api-criteria`.

## Decision Gates

### SharedModule — what it exports

`SharedModule` provides cross-cutting infrastructure that all modules need without importing it explicitly:

| Token / class | Description |
|---|---|
| `LOGGER_SERVICE` | Structured logger |
| `DOMAIN_EVENT_PUBLISHER` | Publishes events to the bus |
| `DOMAIN_EVENT_CONSUMER` | Consumes events from the bus |
| `GlobalExceptionRegistry` | Central exception registry |
| `HttpExceptionFilter` | Global HTTP filter |

### Internal shared per bounded context

Bounded contexts with multiple submodules have their own `shared/` that contains:

| Folder | Content |
| --- | --- |
| **`domain/`** | value objects, interfaces or constants that cross submodules within the BC |
| **`infrastructure/framework/`** | the framework module of the whole BC (wiring), the BC's exception registry |

## Execution Steps

1. Place the piece in the structure from `references/patterns.md`.
2. Apply the module and env Hard Rules.
3. Use `references/module-patterns.md` for the complete modules and the env schema.

## Output Contract

Deliver the piece in its `shared/` folder and the wiring changes in `SharedModule`, `AppModule` or the BC's module.

## References

- [`references/patterns.md`](references/patterns.md): `shared/` structure, internal shared per BC and env validation.
- Read [`references/module-patterns.md`](references/module-patterns.md) for what the modules (`SharedModule`, `AppModule`, `AchievementModule`) wire and the environment variables.
- Read [`references/docs.md`](references/docs.md) for related skills, ADRs and external documentation.
- Load the project's stack skills for HTTP (`stack-nestjs`), persistence, messaging and observability (the matching `stack-*`), and read `references/api-shared.md` in each.
