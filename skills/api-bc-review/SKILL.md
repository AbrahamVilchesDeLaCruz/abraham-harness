---
name: api-bc-review
description: "Trigger: When auditing an existing BC, splitting aggregates into submodules, or assessing whether a concept deserves its own BC. Bounded context review and refactor process in apps/api/: DDD boundaries, submodules, skill alignment and debt checklist."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.1"
---

## Activation Contract

- When auditing an existing bounded context
- Before creating a new BC — deciding whether it is its own BC, a submodule of another, or shared
- When a BC grows and mixes several aggregates without clear boundaries
- After a domain redesign (dynamic catalog, new events, backoffice)

## Hard Rules

- It **does not replace** the layer skills (`api-domain`, `api-application`, etc.) — it **orchestrates** them in order.
- Use the checklist in `assets/audit-checklist.md` during the audit.
- Load the indicated skill before fixing each row of the Phase 3 and Phase 7 tables.
- **Forbidden:** loose layers (`domain/`, `application/`) at the BC root when there are submodules.
- **Forbidden** in domain and application classes/files: `Service`, `Dto` in application and `.response.ts` per controller (alternatives in Phase 4).

## Decision Gates

Phase 1 — Does it deserve its own bounded context? Answer in business language:

| Question | If yes → |
|----------|---------|
| Does it have its own ubiquitous language, distinct from User/Identity? | Separate BC |
| Does its lifecycle evolve independently (catalog, rules, unlocks)? | Separate BC |
| Is it only shown in another module's profile/UI? | Does **not** imply a submodule — it is presentation |
| Is it a projection of events from other BCs (like Reporting)? | Valid consumer/projector BC |
| Does it reference `userId` without being a property of the User aggregate? | Reference by ID, do not move to Identity |

**Rule:** if adding a new feature only touches the owning BC (+ the event emitter), the boundary is right.

## Execution Steps

Details of Phases 2, 3, 4, 6 and 7 are in `references/review-phases.md`.

1. Phase 1: apply the Decision Gates table.
2. Phase 2: if the BC has **multiple cohesive aggregates**, split into submodules.
3. Phase 3: audit the per-layer alignment with its table.
4. Phase 4: verify the allowed suffixes.
5. Phase 5 — Recommended refactor order:
   1. **Boundaries and submodules** — folders, a registry per submodule, the `{bc}` shared module
   2. **Domain** — aggregates, VOs, events from the aggregate
   3. **Application** — use cases, extract logic from subscribers
   4. **Infrastructure** — repos, controllers with envelope, **entity + migration in the ORM data source options**
   5. **Use case tests** — migrate paths, Object Mothers, domain policies/strategies through use cases
   6. **Operability and contract** — logger, API documentation, docs (see Phase 7)
   7. **API E2E** — at least one `*.e2e-spec.ts` per HTTP endpoint of the BC
   8. **Client** — `ApiEnvelope<T>` + i18n if the copy lives in the frontend
6. Phase 6: detect duplicated source of truth, decide on **one** source and record it in an ADR if it is a product decision.
7. Phase 7: audit operability, contract and documentation **after** boundaries and DDD layers.

## Output Contract

### Suggested commits per responsibility

Separate into reviewable work units — one commit per area:

```
feat({bc}): log {event} in {DomainService}
feat({bc}): document GET /{resource} in OpenAPI
docs({bc}): sync spec, bounded-contexts and messaging design
test({bc}): add catalog/domain parity tests
test({bc}): add GET /{resource} e2e coverage
test({bc}): add domain object mothers
feat(client): type {resource} API response with ApiEnvelope
```

## References

- [`references/review-phases.md`](references/review-phases.md) — Phases 2, 3, 4, 6 and 7, documentation lag signals and anti-patterns.
- [`assets/audit-checklist.md`](assets/audit-checklist.md) — audit checklist.
- [`references/docs.md`](references/docs.md) — DDD references and related skills.
- `apps/api/AGENTS.md` — DDD submodules
- For framework detail, load each stack skill the project uses and read its `references/api-bc-review.md`: HTTP framework (`stack-nestjs`), persistence, testing (`stack-vitest`), messaging (`stack-rabbitmq`), observability (`stack-observability`).
