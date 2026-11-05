# Persistence Entity and Module Boundaries

Repository ports, adapter responsibilities and aggregate mapping belong to `api-repository`. Use this reference only for infrastructure placement and wiring.

## Persistence entities

- Keep persistence entities under `infrastructure/persistence/`, never in domain or application.
- Give the class an `Entity` suffix. Map plural `snake_case` table/column names explicitly; retain `camelCase` properties in code.
- Keep database-only nullability, defaults and column types in the entity mapping. Translate to domain primitives at the repository adapter boundary.
- Do not expose an entity from a controller, use case or domain interface.

## Framework module

The bounded-context framework module imports the persistence entities and registers controllers and providers. Bind the repository port to its adapter using the token beside the port; use `api-di` for provider registration details. Do not move domain rules or query construction into the module.
