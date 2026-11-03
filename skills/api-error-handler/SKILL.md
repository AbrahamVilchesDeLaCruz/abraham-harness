---
name: api-error-handler
description: "Trigger: When creating domain errors, registering exceptions in a module, or configuring the HTTP filter in apps/api/. HTTP error handling conventions in the API: GlobalExceptionRegistry, per-module registries and HttpExceptionFilter."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---


## Activation Contract

- When creating a new domain error that must map to an HTTP status
- When adding a new module with its own exceptions
- When configuring the global exception filter

## Hard Rules

- **Principle**: each module is responsible for registering its own errors. Maintenance goes where the code lives.
- The domain error **never** knows the HTTP status — that is the responsibility of infrastructure
- **The exception registry decides the HTTP status of an error**: it maps each domain exception to a status. Framework HTTP exceptions (validation, guards) keep their own status. Any other exception with no mapping gets the default response, also from the registry
- A controller never decides the status of an error and never uses try/catch to map one
- One `ExceptionRegistry` per submodule, in `{bc}/{module}/infrastructure/framework/`, and each submodule exports its own registry. No registry holds the errors of several submodules
- The bounded context's shared module gathers its submodules' registries, and it is what reaches the root shared module. The root shared module never receives a submodule directly
- `GlobalExceptionRegistry` is the aggregator: each registry registers its map there, and it resolves the status of an exception
- The registry is initialized in the module-initialization hook — this guarantees it is ready before requests arrive
- Use `exception.constructor.name` as the key — it works even if the bundle minifies, because class names are explicit

## Decision Gates

### HTTP status by domain error type

| Error type | HTTP Status |
| --- | --- |
| Entity not found (`NotFound`) | `404 NOT_FOUND` |
| Invalid / empty field (`Empty`, `Invalid`) | `422 UNPROCESSABLE_ENTITY` |
| State conflict (`AlreadyExists`, `InvalidStatus`) | `409 CONFLICT` |
| Action not allowed or no permissions (`CannotX`) | `403 FORBIDDEN` |
| Invalid credentials / expired token | `401 UNAUTHORIZED` |
| Usage limit exceeded (`LimitExceeded`) | `429 TOO_MANY_REQUESTS` |
| Any other exception with no mapping (framework HTTP exceptions keep their own status) | Default response of the registry: `500 INTERNAL_SERVER_ERROR` |

## Execution Steps

1. Create the domain error without an HTTP status.
2. Assign its status with the table in the submodule's `{module}-exception-registry.ts`.
3. Register the registry as a provider of the submodule, and export it.
4. Check that the bounded context's shared module imports the submodule.
5. Check against the anti-patterns in `references/patterns.md`.

## Output Contract

Deliver the domain error, its entry in the submodule's registry and the registry as a provider and an export of the submodule.

## References

- [`references/patterns.md`](references/patterns.md): architecture, `GlobalExceptionRegistry`, `HttpExceptionFilter`, per-submodule registry and anti-patterns.
- Use the template in [`assets/exception-registry.template.md`](assets/exception-registry.template.md) when creating the registry of a new submodule.
- Read [`references/docs.md`](references/docs.md) for the error envelope format and external docs.
- Load the project's stack skill for HTTP (`stack-nestjs`) and read its `references/api-error-handler.md`.
