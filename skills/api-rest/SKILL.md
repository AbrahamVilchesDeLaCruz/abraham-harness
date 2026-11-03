---
name: api-rest
description: "Trigger: When designing or implementing endpoints in apps/api/. RESTful API conventions: routes, HTTP methods, status codes and DDD actions with POST."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---


## Activation Contract

- When designing the routes of a new resource
- When choosing the correct HTTP method for an action
- When deciding the status code of a response
- When modeling domain actions that do not fit pure CRUD

## Hard Rules

- Resources in plural `kebab-case`: `/products`, `/reviews-sessions`
- No verbs in the route: never `/products/create` or `/getProduct`
- Maximum nesting of 2 levels: `/collections/:id/products` — if you need more, rethink it
- IDs always in the path, never in the body for GET/DELETE
- DDD actions always act on an existing resource: `/orders/:id/{action}`.
- Every endpoint must be documented in the API documentation (OpenAPI). The documentation markers apply at two levels: class and method.
- Include only the status codes the endpoint can really return — do not add generic markers that do not apply.
- The action method is always called `handler`.
- Each HTTP action is an independent controller. See skill `api-infrastructure` for naming and payloads.
- All the resource's controllers are registered in the module.
- **Request**: validated with a validation DTO only in the controller (it does not pass into application)
- **Response**: flat primitives — never domain entities
- Response JSON uses camelCase.
- List query params: the controller extracts them and passes them to the use case as primitives — see skill `api-criteria`.

## Decision Gates

### Status codes

| Situation | Status |
| --- | --- |
| Successful GET with a result | `200 OK` |
| Successful GET without a result (empty list) | `200 OK` with `[]` |
| Successful POST that creates a resource or returns data | `201 CREATED`, with the data in the body when it returns any |
| Successful POST DDD action with an empty response body | `200 OK` |
| Successful PATCH that receives a body | `204 NO CONTENT` with an empty response body |
| Resource not found | `404 NOT FOUND` |
| Failed validation (invalid field) | `422 UNPROCESSABLE ENTITY` |
| State conflict | `409 CONFLICT` |
| Unauthorized (no token) | `401 UNAUTHORIZED` |
| No permissions (valid token, forbidden action) | `403 FORBIDDEN` |

- DDD actions with POST (`/orders/:id/complete`, `/orders/:id/resume`) normally have an empty response body and return `200 OK`. If one does return data, it returns `201 CREATED`.
- A POST that creates a resource or returns data, such as `POST /orders` (without `:id`), returns `201 CREATED`, with the data in the body when it returns any.
- A PATCH that receives a body always returns `204 NO CONTENT` with an empty response body.

### When to use a DDD action vs PATCH

When a domain action is not pure CRUD — it has its own semantics — model it as a sub-resource with POST.

| Criterion | Use PATCH | Use POST /{action} |
| --- | --- | --- |
| Simple data change | ✅ | |
| State transition with business rules | | ✅ |
| The action has a name in the domain (`review`, `archive`, `start`) | | ✅ |
| Idempotent | ✅ | depends |

## Execution Steps

1. Define the route with the Hard Rules and choose the method with the Decision Gates.
2. Assign the status code and the documentation markers (see `references/patterns.md`).
3. Create one controller per action and register it in the module.
4. Check against the anti-patterns in `references/patterns.md`.

## Output Contract

Deliver the route, the method, the status code and the documented controller of each action.

## References

- [`references/patterns.md`](references/patterns.md): base routes, DDD actions, documentation by level and status, `handler`, controllers, query params and anti-patterns.
- Read [`references/docs.md`](references/docs.md) for related skills, ADRs and external documentation.
- Load the project's stack skill for HTTP (`stack-nestjs`) and read its `references/api-rest.md`.
