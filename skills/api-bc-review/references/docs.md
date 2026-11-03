# api-bc-review — Docs & References

## Related Skills

| Skill | Why read it |
|---|---|
| `api-domain` | Aggregate, Value Objects, Repository interface — what to review in domain/ |
| `api-application` | Use Cases in application/, Domain Services in domain/ — what to review |
| `api-infrastructure` | Controllers, ORM entities — what to review in infrastructure/ |
| `api-di` | Tokens, modules — how to assess the dependency graph |
| `api-events` | Subscriber, EventBus — review of the event flow |
| `api-testing` | Object Mothers, mocks — how to assess test quality |

## DDD References

- [Domain-Driven Design Reference (Evans)](https://www.domainlanguage.com/ddd/reference/) — Bounded Context, Aggregate, Ubiquitous Language
- [Implementing DDD (Vaughn Vernon)](https://vaughnvernon.com/?page_id=168) — tactical patterns with examples
- [Patterns, Principles, and Practices of DDD (Millett & Tune)](https://www.oreilly.com/library/view/patterns-principles-and/9781118714706/) — Strategic Design

## Architectural Decisions in This Project

- BCs communicate only via domain events (message bus) or API calls — never shared repositories
- A BC may have multiple internal framework modules if it carries a lot of load
- The `shared/` inside a BC exports interfaces, not implementations

## Internal Docs

| Doc | Relevant content |
|---|---|
| `docs/engineering/backend-architecture.md` | Rules of the architecture being audited (layers, dependencies, modules) |
| `docs/engineering/engineering-principles.md` | Principles each BC must respect (SRP, DIP, OCP) |
