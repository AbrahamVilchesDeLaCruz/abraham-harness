---
name: client-testing
description: "Trigger: When creating component tests, E2E tests, or API mocks that intercept HTTP. Test pyramid: unit and integration tests, E2E of critical flows, HTTP interception and Object Mothers in apps/client/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## Activation Contract

- When creating tests of mappers, hooks, Components or Containers
- When configuring HTTP interception of calls in tests
- When writing E2E tests

## Hard Rules

- Mappers and pure hooks → always unit tests
- Repository → unit test: mock the pod's HTTP calls, and assert the ViewModels it returns
- Server-state hook → unit test: mock the repository, never the API client
- Component (presentational) → view renderer, mocked props, no queries
- Container → view renderer + HTTP interception, intercepting real HTTP: the test crosses the hooks, the repository and the API client
- E2E → browser runner, only critical flows — happy path + main error
- Never mock the whole server-state library module — use HTTP interception
- Override the HTTP handler per case, inside the `it`
- Reset the HTTP handlers in `afterEach`, always
- Client Object Mother: Mother in `__tests__/XxxMother.ts` next to the test; shared Mothers go in `test/shared`. They use fixed literals (no random data generator) — client tests prioritize readability.

```typescript
export class ProductMother {
  static one(overrides?: Partial<ProductVM>): ProductVM { ... }
  static list(count: number): ProductVM[] { ... }
}
```

Anti-patterns:

- ❌ Mocking the server-state library directly.
- ❌ E2E test for everything — the browser runner is slow and fragile. A test such as `mapper formats the dates` that opens a page belongs in a unit test.
- ❌ Container without HTTP interception — mocking the repository, the fetch function or the hooks.

## Decision Gates

| What | Level | Tool | Which reference to load |
|---|---|---|---|
| Mappers | Unit | Test runner | `component-patterns.md` |
| Repository | Unit | Test runner | `component-patterns.md` |
| Pod hooks | Unit | Test runner + hook harness | `component-patterns.md` |
| Component (presentational) | Integration | View renderer | `component-patterns.md` |
| Container (with queries) | Integration | View renderer + HTTP interception | `container-integration.md` |
| Critical end-to-end flow | E2E | Browser runner | `container-integration.md` |

Test pyramid:

```
         /\
        /E2E\          ← Browser runner — critical user flows
       /──────\
      /Integr. \       ← View renderer — Container + Component together with HTTP interception
     /──────────\
    /   Unit     \     ← Test runner — hooks, repositories, mappers, pure utils
   /______________\
```

## Execution Steps

1. Choose level and tool with the Decision Gates table.
2. Load the reference the table indicates.
3. Write the test following the Hard Rules.

## Output Contract

Tests at the level and with the tool the Decision Gates table sets, with none of the anti-patterns in the Hard Rules.

## References

- [`references/component-patterns.md`](references/component-patterns.md) — Read `references/component-patterns.md` for the patterns of unit tests (mappers, hooks) and Component integration tests.
- [`references/container-integration.md`](references/container-integration.md) — Read `references/container-integration.md` for Container integration tests with HTTP interception and E2E tests.
- [`references/docs.md`](references/docs.md) — Read `references/docs.md` for related skills, ADRs and internal documentation.
- Load the project's stack skill for tests (`stack-vitest`) and read its `references/client-testing.md`.
- Load the project's stack skill for server state (`stack-tanstack-query`) and read its `references/client-testing.md`.
