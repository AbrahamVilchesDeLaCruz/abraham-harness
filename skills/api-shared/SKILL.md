---
name: api-shared
description: "Trigger: When creating or modifying the shared module, adding environment variable validation, or cross-cutting infrastructure. Global shared module, shared bounded context, env validation in apps/api/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.1"
---


## Activation Contract

- When creating or modifying the global shared module
- When creating an internal shared of a bounded context
- When adding environment variable validation
- When registering cross-cutting infrastructure (logger, event bus, global filters)

## Hard Rules

### Modules

- The shared module is imported **only once** in the application root module — it is global
- The config module and the persistence root connection are configured in **the application root module**, not in the shared module.
- The config module is declared global so the config service is available in all modules
- Persistence is configured through a builder function that parses `DATABASE_URL`
- The shared module does not import or re-export the config module or the persistence module
- A BC with several aggregates has submodules, and works almost as a modular monolith
- The application root module imports each BC's modules directly
- The root shared module receives **only the BCs' shared modules**, never a submodule directly
- A BC's shared module **is not global**. It gathers its submodules and their exception registries, and it reaches the root shared module
- A BC's modules never import the root shared module: it is global, and it imports the BC
- Submodules export their exception registry, plus only what other BCs need (repository tokens or domain services)
- Automatic schema synchronization is off **always** — migrations are the source of truth of the schema

### Env

- Abort-early off always — see all errors at once
- Required in everything that has no default — fails at bootstrap, not at runtime
- Env validation uses the schema library the stack skill names — do not pick another one
- Env validation fails at bootstrap — if a variable is missing, the app does not start

### Criteria + persistence

- The Criteria pattern is applied **directly in each repository** with a query builder — there is no shared converter. Each repository applies its own filters because it can have different relations and aliases.
- See the canonical implementation in skill `api-criteria`.

## Decision Gates

### The shared module — what it exports

The shared module provides cross-cutting infrastructure that all modules use without importing it:

| Token / class | Description |
|---|---|
| `LOGGER_SERVICE` | Structured logger |
| `DOMAIN_EVENT_PUBLISHER` | Publishes events to the bus |
| `DOMAIN_EVENT_CONSUMER` | Consumes events from the bus |
| `GlobalExceptionRegistry` | Aggregator of the exception registries |
| `HttpExceptionFilter` | Global HTTP filter |

### Internal shared of a bounded context

A BC's `shared/` contains:

| Folder | Content |
| --- | --- |
| **`domain/`** | value objects, interfaces or constants that cross submodules within the BC |
| **`infrastructure/framework/`** | the BC's shared module, which gathers its submodules and their exception registries |

Each submodule has its framework module and exception registry in `{bc}/{module}/infrastructure/framework/`.

## Execution Steps

1. Place the piece in the structure from `references/patterns.md`.
2. Apply the module and env Hard Rules.
3. Use `references/module-patterns.md` for the complete modules and the env schema.

## Output Contract

Deliver the piece in its `shared/` folder and the wiring in the shared module, the application root module or the BC's shared module.

## References

- [`references/patterns.md`](references/patterns.md): `shared/` structure, internal shared per BC and env validation.
- Read [`references/module-patterns.md`](references/module-patterns.md) for what the modules (the shared module, the application root module, a BC module) wire and the environment variables.
- Read [`references/docs.md`](references/docs.md) for related skills, ADRs and external documentation.
- Load the project's stack skills for HTTP (`stack-nestjs`), persistence, messaging and observability (the matching `stack-*`), and read `references/api-shared.md` in each.
