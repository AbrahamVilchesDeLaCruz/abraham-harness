---
name: api-testing
description: "Trigger: When creating or modifying tests in apps/api/, creating Object Mothers, or mocking ports. API testing conventions: unit tests from application, controller E2E, Object Mother, /test structure, typed port mocks."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## Activation Contract

- When creating a use case, subscriber or domain service test
- When creating an Object Mother for an aggregate, value object or request
- When mocking a repository, publisher or other port
- When structuring the `/test` folder

## Hard Rules

- `/test` mirrors `/src`; specs never live under `src/`
- A use case test is a unit test. `src/{bc}/{module}/application/{action}/{use-case}.ts` is tested in `test/{bc}/{module}/application/{action}/`, which holds `request-{use-case}.mother.ts` and `{use-case}.spec.ts`
- Use focused integration or contract checks when a distinct risk needs a real repository, database, broker or adapter
- Subscribers are unit tested with an event Mother; never start the bus
- E2E tests cover controllers only. Business rules and error cases are unit tests; the E2E asserts the HTTP contract (status, body, guards, validation)
- Domain tests always go through a use case, using Object Mothers. Aggregates and value objects are never tested on their own. The only exception is a larger domain service you want to test on its own
- A Mother lives next to the test that uses it. Shared Mothers go in `test/shared`
- **Rule**: the test-data library lives only in `MotherCreator`. Never import it directly in a domain Mother.
- Use cases are instantiated directly with `new UseCase(dep1, dep2, ...)` in `beforeEach` — no DI container is used
- Reset only the mock methods the test uses
- Freeze the clock with the fake-timers helper, and restore it after the test, when the aggregate or event depends on `new Date()`
- Each Mother in its own file — never inline in the spec
- `random(overrides?)` always accepts partial overrides
- `from(request)` when the use case receives a request object
- Value Object Mothers expose `invalid()` when the test needs it
- Test each distinct decision once; group equivalent variants and keep business rules at unit level
- Imports from src use the `@/` alias; imports from test use `@test/`
- No concrete adapter in an application test, no state shared between tests, no magic string when a Mother exists, no untyped mock functions for typed ports

## Decision Gates

| Level | What it tests |
|---|---|
| **Unit** | use cases and subscribers with mocked ports and Object Mothers, which exercise the domain — never concrete adapters; a larger domain service you want to test on its own — fast, no I/O. This is the large layer |
| **E2E** | controllers only: real HTTP against the test database, run through the project's compose test environment |

| Port | Strategy |
|---|---|
| Repository | `createMock<ProductRepository>()` |
| DomainEventPublisher | `createMock<DomainEventPublisher>()` |
| Domain services / ports | `createMock<PortOrService>()` |

## Execution Steps

1. Place the test and its Mothers with `references/test-structure.md`.
2. Compose the Mothers with the hierarchy in `references/test-structure.md`; start from the template `assets/object-mother.template.md`.
3. Write the spec with the canonical pattern in `references/use-case-spec.md`.
4. Review the anti-patterns in `references/test-structure.md`.

## References

- [`references/use-case-spec.md`](references/use-case-spec.md) — full canonical use case test pattern, Object Mother examples, mocks and describe naming.
- [`references/test-structure.md`](references/test-structure.md) — pyramid, `/test` structure, Mother hierarchy and anti-patterns.
- [`assets/object-mother.template.md`](assets/object-mother.template.md) — generic Object Mother template.
- [`references/docs.md`](references/docs.md) — related skills, ADRs and documentation.
- Load the project's stack skill for testing (`stack-vitest`) and read its `references/api-testing.md` for the mock library, fake timers, `MotherCreator` and primitive Mothers.
- Load the project's stack skill for the HTTP framework (`stack-nestjs`) and read its `references/api-testing.md` for E2E tests.
