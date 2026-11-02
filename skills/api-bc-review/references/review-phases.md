# Bounded Context Review — Detailed Phases

## Phase 2 — One BC or DDD submodules?

If the BC has **multiple cohesive aggregates**, split:

```
apps/api/src/{bc}/
├── {module-a}/     ← owner of aggregate A
├── {module-b}/     ← owner of aggregate B
└── shared/         ← cross-module VOs + framework module + exception registry
```

See `apps/api/AGENTS.md` → *DDD modules inside a Bounded Context*.

`achievement` example:
- `catalog/` — achievement definitions (catalog, unlock rules)
- `progress/` — `UserAchievementProgress` aggregate (counters, touched modules)
- `user-achievement/` — unlocks per user
- `shared/` — `AchievementKey`, `AchievementCategory`, `AchievementModule`

**Forbidden:** loose layers (`domain/`, `application/`) at the BC root when there are submodules.

## Phase 3 — Per-layer alignment checklist

Use it as an audit table. Load the indicated skill before fixing each row.

| Area | Skill | What to verify |
|------|-------|---------------|
| Aggregate + VOs | `api-domain` | `AggregateRoot`, `fromPrimitives`/`toPrimitives`, VOs without suffix |
| Domain errors | `api-domain`, `api-error-handler` | `{Entity}{Problem}`, registry in `shared/infrastructure/framework/` |
| Repository | `api-domain` | `match/search/save/remove` contract, `toDomain`/`toEntity` |
| Use cases | `api-application` | `{Entity}{Verb}`, `execute()` method, primitives in/out |
| Domain services | `api-application`, `api-domain` | In `domain/`, **no `Service` suffix** in class/file |
| Subscribers | `api-events` | Next to the use case, `on()` only delegates, queue naming |
| Events | `api-domain-events` | `record()` in the aggregate, `pullDomainEvents()` after `save()` |
| Query controllers | `api-response`, `api-rest` | `ApiResponse.of()` / `PaginatedApiResponse.of()` with `meta` |
| Command controllers | `api-response` | HTTP status only, no body |
| DI | `api-di` | `Symbol` token next to the interface in domain |
| Tests | `api-testing` | Mirror the `test/{bc}/{module}/` structure, Object Mothers |

## Phase 4 — Naming: allowed suffixes

| Suffix | When |
|--------|--------|
| `Repository` | Persistence interface in domain |
| `Event` | Domain events |
| `Exception` / domain error | Typed errors |
| `Entity` | ORM model in infrastructure |
| ORM name (prefix) | Concrete repo/query implementation |

**Forbidden** in domain and application classes/files:
- `Service` — use `AchievementCatalogFinder`, `ProductFinder`
- `Dto` in application — use `Request*` / `Response*`
- `.response.ts` per controller

## Phase 6 — Duplicated source of truth

Warning signs (e.g. `achievement` pre-refactor):
- Catalog in code **and** in an unused DB
- Rules hardcoded in subscribers **and** in evaluators
- i18n in the client **and** title/description in the API with no contract

Decide on **one** source and record it in an ADR if it is a product decision.

**Code ↔ migrations parity:** if the catalog lives in the domain, add a parity test (`{bc}-catalog-parity.spec.ts`) that compares the catalog keys with the migrations seed and `ALL_*_KEY_VALUES`.

## Phase 7 — Operability, contract and documentation

Audit **after** boundaries and DDD layers. Load the indicated skill before fixing each row.

| Area | Skill | What to verify |
|------|-------|---------------|
| **Logger** | `api-observability` | `LOGGER_SERVICE` injected in domain services / use cases that execute relevant state (`unlock`, `create`, `import`). `info` log with context (`userId`, aggregate id). Do **not** log in controllers — the filter/interceptor does it |
| **API documentation** | `api-rest` | Per GET endpoint: operation, bearer auth (`access-token`), properties and optional properties on Query/Payload, response with the envelope schema `{ data, meta }`, codes 401/422. Tags alone = incomplete |
| **BC docs** | — | `docs/apps/api/{bc}/README.md`: submodules, endpoints, consumed/published events, tables, **v2** handlers (real subscriber names) |
| **Cross-cutting docs** | — | Sync if the BC emits/consumes events: the feature spec, `docs/domain/bounded-contexts.md` (diagram + table), the messaging design doc (exchanges, queues, handlers) |
| **Persistence** | `api-migrations` | Every new entity in the ORM entity list **and** its migration in the ORM migration list. Omitting it silently breaks E2E/CI via async subscribers |
| **API E2E** | `api-testing` | `test/{bc}/**/infrastructure/*.e2e-spec.ts`: JWT, envelope, business happy path, 422 validation. Reuse helpers from other BCs (`registerAndLogin`, `waitUntil`) |
| **Object Mothers** | `api-testing` | `test/{bc}/{module}/domain/*-mother.ts` for aggregates/VOs used in ≥2 specs. Avoid repeated inline `fromPrimitives` |
| **Critical domain tests** | `api-testing` | Policies, strategies and eligibility rules with their own tests (not only via unlocker integration) |
| **Client** | `client-api` | `ApiEnvelope<T>` in fetches, mapper + types, i18n if the API returns only structural keys |
| **Custom metrics** | `api-observability` | Optional — counters on key mutations (`*_total`). HTTP/messaging infrastructure is already covered globally |

### Documentation lag signals (e.g. `achievement` pre-fix)

- v1 handler names in the spec (`UnlockAchievementOnOrderCompleted` vs `UnlockUserAchievementOnOrderCompleted`)
- Incomplete consumed events (`PaymentRecorded`/`ProductViewed` missing from bounded-contexts)
- Undocumented queues (`update_progress_on_payment_recorded`)
- README without new tables (`user_achievement_progress`)

## Anti-patterns

```typescript
// ❌ Whole BC inside identity/user because it is shown in /profile
// ❌ Subscriber with business rules in on()
// ❌ Event published manually in a use case without aggregate.record()
// ❌ GET returns { data } without meta
// ❌ achievement-catalog-finder.service.ts  ← forbidden Service suffix
// ❌ Controller with tags only — no operation or response schema documented
// ❌ Business unlock/mutation without logger.info with context
// ❌ ORM entity not registered in the data source options
// ❌ New subscriber without a row in the messaging design doc and bounded-contexts.md
// ❌ E2E that only mocks unit — no *.e2e-spec.ts for the HTTP endpoint
```
