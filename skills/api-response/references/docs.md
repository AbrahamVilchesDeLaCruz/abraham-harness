# api-response — Docs & References

## Related Skills

| Skill | Why read it |
|---|---|
| `api-infrastructure` | Controllers — where `ApiResponse.of()` is used |
| `api-validation` | Query DTOs — where `page` and `pageSize` for `PaginationMeta` come from |
| `api-error-handler` | Error response format — different from the success envelope |
| `api-criteria` | Pagination built in the use case, totals returned to the controller |

## External Documentation

- [HTTP Status Codes — MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) — complete reference
- [REST API Design — Pagination](https://www.moesif.com/blog/technical/api-design/REST-API-Design-Filtering-Sorting-and-Pagination/) — pagination conventions

## CQRS Inspiration

The response pattern follows the CQRS (Command Query Responsibility Segregation) principle:
- **Queries** (GET) → always return data — they use the `ApiResponse<T>` envelope
- **Commands** (PATCH, DELETE, POST actions) → return only the operation result — `void` + status code

This makes the API predictable: if the endpoint is GET, there is always a `data` field.

## Internal Docs

| Doc | Relevant content |
|---|---|
| `docs/engineering/backend-architecture.md` | Envelopes in Infrastructure — use cases return primitives, controllers wrap them |

## Relevant infrastructure files

| File | Purpose |
|---|---|
| `shared/infrastructure/http/response/api-response.ts` | `ApiResponse<T>`, `PaginatedApiResponse<T>`, `ResponseMeta`, `PaginationMeta` |
| `shared/infrastructure/http/resolve-request-id.ts` | `resolveRequestId(req)` — gets or generates the request ID |
