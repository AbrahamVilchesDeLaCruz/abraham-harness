---
name: api-response
description: "Trigger: When defining an endpoint's response format, implementing pagination, or command responses. Response envelope, pagination, commands without a body in apps/api/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---


## Activation Contract

- When defining the response format of a read endpoint (queries)
- When defining the response of endpoints that modify state (commands)
- When implementing the response envelope in controllers

## Hard Rules

- No `success` field — the HTTP status expresses it
- No `message` field — errors have their own format (see `api-error-handler`)
- `pagination` only if the endpoint accepts `page` and `limit`
- `meta.request_id` always via `resolveRequestId(req)` — never inline
- Auth endpoints use a passthrough response object to manage cookies and return the token directly without an envelope. This is the only exception to the `ApiResponse<T>` pattern.

### Anti-patterns

```typescript
// ❌ .response.ts files per controller — FORBIDDEN
// search-orders-get.response.ts

// ❌ resolveRequestId inline in the controller (unsafe: does not validate array or empty string)
return ApiResponse.of(data, req.headers['x-request-id'] as string ?? crypto.randomUUID());

// ❌ Envelope on pure commands
async handler(): Promise<{ success: true }> { ... }

// ❌ Without resolveRequestId
return ApiResponse.of(data, 'hardcoded-id');

// ❌ Omitting ApiResponse on non-auth endpoints
async handler(): Promise<ProductPrimitives[]> { ... } // must be ApiResponse<ProductPrimitives[]>
```

## Decision Gates

### CQRS principles

| Type | Response | Status |
|---|---|---|
| **Query** (GET) | `ApiResponse<T>` or `PaginatedApiResponse<T>` | `200` |
| **Command with data** (POST that returns ID/data) | `ApiResponse<T>` | `201` |
| **Pure command** (PATCH/DELETE/actions) | `void` — status code only | `204` |
| **Auth** (login/register/guest/refresh) | Raw `{ accessToken: string }` — valid exception | `200` / `201` |

### Status Codes

| Operation | Status |
|---|---|
| GET (single or collection) | `200 OK` |
| POST (create with response) | `201 Created` + `ApiResponse<T>` |
| POST (DDD action without response) | `204 No Content` |
| PATCH / PUT | `204 No Content` |
| DELETE | `204 No Content` |

## Execution Steps

1. Classify the endpoint with the Decision Gates.
2. Return the matching envelope, or `void` on pure commands.
3. Use `references/response-classes.md` for the classes and the complete controllers.

## Output Contract

### Envelope format

```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2026-05-21T12:00:00Z",
    "request_id": "req_abc123"
  }
}
```

With pagination:

```json
{
  "data": [...],
  "pagination": {
    "page": 1, "limit": 10,
    "total_items": 125, "total_pages": 13,
    "has_next_page": true, "has_prev_page": false
  },
  "meta": { "timestamp": "...", "request_id": "..." }
}
```

## References

- Read [`references/response-classes.md`](references/response-classes.md) for the complete implementations of `ApiResponse`, `PaginatedApiResponse`, `resolveRequestId` and complete controller examples.
- Read [`references/docs.md`](references/docs.md) for related skills, ADRs and external documentation.
- Load the project's stack skill for HTTP (`stack-nestjs`) and read its `references/api-response.md`.
