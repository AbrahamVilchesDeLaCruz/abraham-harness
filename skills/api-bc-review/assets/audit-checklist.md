# BC Audit Checklist

Use this checklist when auditing an existing bounded context or designing a new one.

## Phase 1 — Scope & Boundaries

- [ ] The BC has a single ubiquitous language — no term means two things
- [ ] The BC owns its data — no direct DB access from other BCs
- [ ] Cross-BC communication goes through domain events or API calls — never shared repositories
- [ ] The BC name reflects a business capability, not a technical layer (`sales`, not `order-service`)

## Phase 2 — Domain Layer

- [ ] All business rules live in aggregates or domain services
- [ ] No framework decorators, ORM decorators or framework imports in `domain/`
- [ ] Value Objects are immutable — no setters
- [ ] Domain Errors extend `DomainError` base class
- [ ] Aggregates call `this.record()` for every state change — domain events are complete
- [ ] `fromPrimitives()` factory method exists in each aggregate

## Phase 3 — Application Layer

- [ ] One use case per file — single responsibility
- [ ] Use cases receive `Request*` type — never raw HTTP payloads
- [ ] All ports injected by token
- [ ] `repository.save()` before `publisher.publish()` (token: `DOMAIN_EVENT_PUBLISHER`)
- [ ] Write use cases always inject `DOMAIN_EVENT_PUBLISHER` — if aggregate emits no events, fix the aggregate
- [ ] No business logic in subscribers — they delegate to a use case or domain service
- [ ] Domain services are stateless (or managed by the framework's DI container)

## Phase 4 — Infrastructure Layer

- [ ] One controller per action (`StartOrderPostController`, not `OrderController`)
- [ ] Controllers have API documentation: tags, operation, response
- [ ] ORM models have `Entity` suffix — differ from domain aggregates
- [ ] `toDomain()` and `toEntity()` are private — ORM models never escape the repo
- [ ] `match()` applies ALL fields of `Criteria`: filters, order, page, pageSize
- [ ] Exception registry registered at module startup

## Phase 5 — DI & Modules

- [ ] Tokens are `Symbol` — defined next to the interface
- [ ] Module registers its ORM entities for the feature
- [ ] Shared BC module exports only tokens — never concrete classes
- [ ] No circular imports between BCs

## Phase 6 — Events

- [ ] Event class has `static readonly EVENT_NAME`
- [ ] `eventName()` instance method returns `EVENT_NAME`
- [ ] `fromPrimitives()` static method exists for message bus deserialization
- [ ] Subscriber queue name follows: `{bc}.{verb}_{object}_on_{event_past_tense}` — e.g. `achievement.unlock_achievement_on_order_completed`
- [ ] Subscriber class name follows: `{DomainService}On{EventName}` — e.g. `UnlockUserAchievementOnOrderCompleted`
- [ ] Subscribers handle idempotency (Option A: natural check, Option B: inbox table)

## Phase 7 — Testing

- [ ] Use case tests use `createMock<Repository>()` — no concrete adapters
- [ ] Object Mothers exist for every aggregate and request type
- [ ] `beforeEach` resets each mock method explicitly and recreates the use case instance
- [ ] Fake timers when aggregate depends on `new Date()`

## Debt Score

Count unchecked items:
- 0–2: Healthy BC
- 3–5: Minor debt — schedule cleanup
- 6–10: Significant debt — plan refactor sprint
- 11+: Critical — discuss architectural redesign
