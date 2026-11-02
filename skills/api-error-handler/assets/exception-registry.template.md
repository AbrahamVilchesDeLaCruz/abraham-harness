# Exception Registry Template

Use this when adding error handling to a new module. The registry code lives in the project's stack skill, in `references/api-error-handler.md`.

## File: `{context}/infrastructure/framework/{context}-exception-registry.ts`

The registry `{Context}ExceptionRegistry`:

- Receives `GlobalExceptionRegistry` in its constructor.
- In the module-initialization hook, calls `globalRegistry.register()` with a `Map<string, number>` that maps each domain error's `.name` to its HTTP status, for example `{Entity}NotFound` to not found and `{Entity}AlreadyExists` to conflict.
- Imports all the domain errors of this BC.

## Register in the module

Just add `{Context}ExceptionRegistry` as a provider of `{Context}Module`; its initialization hook runs automatically after the module is initialized, before the first request arrives. The registry itself implements the hook. The module class does **not** need to implement it.

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

## Checklist

- [ ] One registry per bounded context — do not mix errors from different BCs
- [ ] All the BC's domain errors are registered before the first request
- [ ] `GlobalExceptionRegistry` is the only place where DomainError → HTTP is mapped
- [ ] The registry implements the initialization hook — not the module
- [ ] The registry is declared as a provider in the BC's module
