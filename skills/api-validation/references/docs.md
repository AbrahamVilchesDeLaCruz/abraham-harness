# api-validation — Docs & References

## Related Skills

| Skill | Why read it |
|---|---|
| `api-infrastructure` | Where Payloads and Queries live (controllers/ folder) |
| `api-response` | Validation error format in the response |
| `api-error-handler` | `ValidationErrorResponse` — class used in the documentation of `422` responses |
| `api-rest` | Which HTTP method each operation type uses |

## Global input validation config

- Strip unknown properties.
- Throw on unknown properties.
- Auto-transform — needed for number coercion in query params.
- Validation errors → 422 Unprocessable Entity.

## Internal Docs

| Doc | Relevant content |
|---|---|
| `docs/engineering/backend-architecture.md` | Payloads live in Infrastructure — they never pass into Application |
