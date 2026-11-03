---
name: api-application
description: "Trigger: When creating or modifying use cases or domain services in apps/api/. API conventions: Use Cases in `application/` and Domain Services in `domain/`."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---


## Activation Contract

- When creating a new use case
- When creating or modifying a domain service
- When deciding whether logic belongs in a use case or in a domain service

## Hard Rules

### Use Cases

- Name: `{Entity}{Verb}` — agent form.
- One use case = one responsibility = one public method: `execute()`
- Receives a `Request*` type — never loose primitives, never DTO classes
- `Request*` and `Response*` are `type` aliases — never classes with decorators
- Returns primitives, `Response*`, or `void` — never domain entities
- Re-export `Request*` and `Response*` in the same file as the use case.
- Create `response-{entity}-{verb}er.ts` whenever the use case returns more than one field or the type is not a simple primitive.
- **Write use cases always inject `DOMAIN_EVENT_PUBLISHER`** — if the aggregate emits no events, that is a bug in the aggregate, not a reason to omit it
- Inject `LOGGER_SERVICE` and `APP_METRICS` in all use cases that mutate state
- Use `toPrimitives()` to serialize the response
- The name of the injected variable reflects the ROLE, not the concrete class.

### Domain Services

- Name: `{Feature}{Action}` — **no `Service` suffix**
- File: `{feature}-{action}.ts` — e.g.: `product-finder.ts`, `guest-order-policy.ts`
- Method with a descriptive verb: `findOrFail()`, `validate()`, `assertCanX()`
- May be marked as injectable when it needs repositories or other ports
- Static classes for pure policies (no I/O): `GuestOrderPolicy`, `PausedOrderPolicy`

## Decision Gates

Reuse across use cases, not I/O vs no-I/O, decides where the logic goes:

| Situation | Action |
| --- | --- |
| **If only one use case uses the logic** | **→ it stays in the use case, do not extract it** |
| **If several use cases share the logic** | **→ Domain Service in `domain/`** |

### UseCase vs Domain Service

| | Use Case | Domain Service |
| --- | --- | --- |
| **What it is** | One application transaction | Domain logic reused by several use cases |
| **Method** | `execute()` | descriptive verb: `findOrFail()`, `assertCanX()` |
| **Reusable** | No — one concrete flow | Yes — several use cases call it |
| **Where** | `application/{verb}/` | `domain/` |
| **Example** | `ProductCreator.execute()` | `ProductFinder` (used by updater, deleter…) |
| **Criterion** | One single business action | If you extract logic from 2+ use cases, it goes here |

### Use case verbs

| Action | Name |
| --- | --- |
| Create | `ProductCreator` |
| Find one | `ProductFinder` |
| Search several | `ProductSearcher` |
| Update | `ProductUpdater` |
| Delete | `ProductDeleter` |
| Start | `OrderStarter` |
| Complete | `OrderCompleter` |

## Execution Steps

1. Use the Decision Gates to decide whether the logic goes in a use case or in a Domain Service.
2. When creating a use case, start from the template and name it with the verb table.
3. Apply the Hard Rules and check against the anti-patterns in `references/patterns.md`.

## Output Contract

Deliver the use case in `application/{verb}/` with its `Request*` and, if applicable, `Response*` re-exported in the same file; or the Domain Service in `domain/`.

## References

- [`references/patterns.md`](references/patterns.md): code for use cases, `Request*`/`Response*`, domain services, injection and anti-patterns.
- Use the template in [`assets/use-case.template.md`](assets/use-case.template.md) when creating a new use case.
- Read [`references/docs.md`](references/docs.md) for ADRs, related skills and external docs.
- Load the project's stack skill for dependency injection (`stack-nestjs`) and read its `references/api-application.md`. Load the project's test stack skill (`stack-vitest`) and read its `references/api-application.md` when testing use cases.
