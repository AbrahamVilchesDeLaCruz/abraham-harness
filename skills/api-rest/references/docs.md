# api-rest — Docs & References

## Related Skills

| Skill | Why read it |
|---|---|
| `api-infrastructure` | Controllers — implementation of the endpoints |
| `api-validation` | Payloads and Queries — input validation |
| `api-response` | Response formats per HTTP method |
| `api-error-handler` | HTTP errors and their mapping to domain errors |

## External Documentation

- [HTTP Methods — MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) — semantics of GET, POST, PATCH, PUT, DELETE
- [HTTP Status Codes — MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) — complete reference
- [RESTful API Design — Best Practices](https://restfulapi.net/) — naming and resource conventions
- [OpenAPI 3.0 — Specification](https://swagger.io/specification/) — REST API documentation

## Route naming in this project

The text of the first route is kept verbatim; its `←` carries the English translation.

```
GET    /resources          → list/search (con query params)  ← with query params
GET    /resources/:id      → get one
POST   /resources          → create
PATCH  /resources/:id      → partial update
DELETE /resources/:id      → delete

# DDD Actions — verbs as sub-resources via POST
POST   /resources/:id/complete   → OrderCompleter
POST   /resources/:id/abandon    → OrderAbandonner
POST   /resources/:id/pause      → OrderPauser
```

## Internal Docs

| Doc | Relevant content |
|---|---|
| `docs/engineering/backend-architecture.md` | Controllers in Infrastructure — no logic, they only orchestrate request→use case→response |
