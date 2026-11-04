---
name: api-di
description: "Trigger: When defining injection tokens, registering providers in modules, or injecting dependencies in use cases or controllers. Symbol tokens, provider registration, decoupled injection in apps/api/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.1"
---


## Activation Contract

- When defining the injection token for a repository, service or any abstraction
- When registering providers in a module
- When injecting dependencies in use cases or controllers

## Hard Rules

- The domain and the application **must not know the framework exists**. To achieve this, each interface has its own injection token that imports nothing from the framework.
- Tokens are `Symbol` — **always** — not strings (collisions), not framework classes (coupling).
- The token is defined in the same file as the interface — in the domain or shared/domain layer
- Use cases inject by **interface** — never by concrete class
- The parameter type is the **interface** — never the concrete implementation. The injection marker is the only trace of the framework in application/domain.
- Modules are the only ones that know the concrete implementations (persistence, messaging, etc.)
- A module exports the **token** — never the implementation class. The one exception is a submodule's exception registry, which the submodule exports
- The root shared module receives only the shared modules of the bounded contexts, never a submodule directly. A bounded context's shared module gathers its submodules
- A bounded context module never imports the root shared module: it is global, and what it provides is already available
- Format always `SCREAMING_SNAKE_CASE`.

## Decision Gates

### Registration in the module

| Situation | Provider |
| --- | --- |
| Most common case (repositories, services) | Bind the token to a class |
| Singleton shared under multiple tokens | Alias each token to the existing singleton |
| Providers that depend on multiple instances | Bind the token to a factory |

### Naming Conventions

| Abstraction | Token | Example |
|---|---|---|
| Repository | `{ENTITY}_REPOSITORY` | `ORDER_REPOSITORY`, `USER_REPOSITORY` |
| Read-only query | `{ENTITY}_QUERY` | `ORDER_STATS_QUERY`, `USER_STATS_QUERY` |
| Domain selector | `{ENTITY}_SELECTOR` | `PRODUCT_SELECTOR` |
| Domain provider | `{ENTITY}_PROVIDER` | `BESTSELLER_PRODUCT_IDS_PROVIDER` |
| External service | `{ENTITY}_SERVICE` | `EMAIL_SERVICE` |
| Event publisher | `DOMAIN_EVENT_PUBLISHER` | shared — publishes domain events |
| Event consumer | `DOMAIN_EVENT_CONSUMER` | shared — consumes message queues |
| Logger | `LOGGER_SERVICE` | shared — Logger interface |
| Metrics | `APP_METRICS` | shared — AppMetrics interface |

## Execution Steps

1. Define the interface and its token in the same file, with the name from the table.
2. Register token → implementation in the module with the matching provider.
3. Inject with the token, typing the parameter with the interface.

## Output Contract

Deliver the interface with its `Symbol` token, the registration in the module and the injection in the use case or controller.

## References

- [`references/patterns.md`](references/patterns.md): interface → token → implementation → registration → injection flow, and the code for each step.
- Use the template in [`assets/di-tokens.template.md`](assets/di-tokens.template.md) when adding tokens and modules to a new BC.
- Read [`references/docs.md`](references/docs.md) for the rationale of Symbol vs string and external docs.
- Load the project's stack skill for dependency injection (`stack-nestjs`) and read its `references/api-di.md`. Do the same for the messaging and logging stack skills (`stack-rabbitmq`, `stack-observability`) when binding those adapters.
