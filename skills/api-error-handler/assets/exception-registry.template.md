# Exception Registry Template

Use this when adding error handling to a new submodule. The registry code lives in the project's stack skill, in `references/api-error-handler.md`.

## File: `{bc}/{module}/infrastructure/framework/{module}-exception-registry.ts`

The registry `{Module}ExceptionRegistry`:

- Receives `GlobalExceptionRegistry` in its constructor.
- In the module-initialization hook, calls `globalRegistry.register()` with a `Map<string, number>` that maps each domain error's `.name` to its HTTP status, for example `{Entity}NotFound` to not found and `{Entity}AlreadyExists` to conflict.
- Imports all the domain errors of this submodule.

## Register in the submodule

Add `{Module}ExceptionRegistry` as a provider of `{Module}Module`, and export it; its initialization hook runs automatically after the module is initialized, before the first request arrives. The registry itself implements the hook. The module class does **not** need to implement it.

The bounded context's shared module imports `{Module}Module`. The root shared module imports only that shared module.

## HTTP Status mapping reference

| Domain Error type | HTTP Status |
|---|---|
| NotFound errors | `404 NOT_FOUND` |
| AlreadyExists errors | `409 CONFLICT` |
| Validation / invariant errors | `422 UNPROCESSABLE_ENTITY` |
| Forbidden / not allowed | `403 FORBIDDEN` |
| Credentials invalid / token expired | `401 UNAUTHORIZED` |
| Rate limit / quota exceeded | `429 TOO_MANY_REQUESTS` |
| External service failure | `502 BAD_GATEWAY` |
| Any other exception with no mapping (framework HTTP exceptions keep their own status) | Default response of the registry: `500 INTERNAL_SERVER_ERROR` |

## Checklist

- [ ] One registry per submodule — do not mix errors from different submodules
- [ ] All the submodule's domain errors are registered before the first request
- [ ] `GlobalExceptionRegistry` is the only place where DomainError → HTTP is resolved
- [ ] The registry implements the initialization hook — not the module
- [ ] The registry is declared as a provider of the submodule and exported by it
- [ ] The bounded context's shared module imports the submodule; the root shared module does not
