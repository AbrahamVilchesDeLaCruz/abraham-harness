---
name: api-validation
description: "Trigger: When configuring global input validation at bootstrap, creating Payload or Query DTOs, or global guards. Global input validation, Payload/Query DTOs in apps/api/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---


## Activation Contract

- When configuring global input validation in the application bootstrap
- When creating a `Payload` (body) or `Query` (query params) DTO
- When defining global guards and global filters at bootstrap

## Hard Rules

### Global input validation

- Strip unknown properties and reject them — **always** — it rejects extra fields
- Transform input and map validation errors to status 422 — **always** — it enables number coercion in queries and maps validation errors to 422

### Payload

- Name: `{Action}{Entity}{Method}Payload` → `CreateProductPostPayload`
- All fields are **strings, numbers or primitive arrays** — no Value Objects
- Never coerce types in Payloads — the JSON body already arrives typed
- `example` values use hardcoded UUID strings — Value Objects are not imported in Payloads

### Payload and Query

- Number coercion **only in Query** for `page`, `pageSize`, `limit` and similar — query params arrive as strings from HTTP
- API documentation on all Payload and Query fields — it is mandatory; in Payload, with `example`

### Guards and filters

- **Global guards and filters do not go in the application bootstrap** — they are registered through DI in the modules:
  - `HttpExceptionFilter` → registered as the global filter in the shared module
  - `JwtAuthGuard`, `GuestAuthGuard`, etc. → provided and exported from the auth module
- Public endpoints are marked with the public marker. See skill `api-auth` for the complete wiring.

## Decision Gates

| Field | Markers |
| --- | --- |
| For simple optional fields | Optional validation + optional documentation |
| For fields that accept explicit `null` | Optional validation + a conditional validation that skips validations when the value is `null` |
| For nested objects (arrays of nested objects) | Nested validation for each item + type conversion to the nested class + array validation |

## Execution Steps

1. Configure global input validation in the application bootstrap with the options from the Hard Rules.
2. Create the Payload or Query from the template and apply the Decision Gates.
3. Register global guards and filters through DI, never in the application bootstrap.

## Output Contract

Deliver the bootstrap configuration, the Payload or Query in `infrastructure/controllers/`, or the guard with its public marker.

## References

- [`references/patterns.md`](references/patterns.md): bootstrap, Payload, Query, guard and public marker.
- Use the template in [`assets/payload.template.md`](assets/payload.template.md) when creating Payloads and Queries.
- Read [`references/docs.md`](references/docs.md) for related skills and internal docs.
- Load the project's stack skill for HTTP and validation (`stack-nestjs`) and read its `references/api-validation.md`.
