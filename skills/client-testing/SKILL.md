---
name: client-testing
description: "Trigger: When creating frontend tests, critical flow tests, or API mocks that intercept HTTP. Unit tests of business logic, complete critical flows, HTTP interception and Object Mothers in apps/client/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## Activation Contract

- When creating tests of mappers, hooks, repositories or critical flows
- When configuring HTTP interception of calls in tests
- When writing E2E tests

## Hard Rules

- Mappers and pure hooks → always unit tests
- Repository → unit test: mock the pod's HTTP calls, and assert the ViewModels it returns
- Server-state hook → unit test: mock the repository, never the API client
- Unit tests cover only the frontend's business logic: mappers, repositories, hooks and pure utils. A rule written inside a Component moves to a hook or mapper and is tested there
- Presentational Components have no tests of their own; the critical flows exercise them
- Critical flow → one complete flow per critical journey, through the Container with HTTP interception (the test crosses the hooks, the repository and the API client), or a browser test for the main journey. Happy path + main error only
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
- ❌ Browser or flow test for everything — they are slow and fragile. A test such as `mapper formats the dates` that opens a page belongs in a unit test.
- ❌ Rendering tests per presentational Component, or snapshot tests of markup.
- ❌ Container without HTTP interception — mocking the repository, the fetch function or the hooks.

## Decision Gates

| What | Level | Tool | Which reference to load |
|---|---|---|---|
| Mappers | Unit | Test runner | `component-patterns.md` |
| Repository | Unit | Test runner | `component-patterns.md` |
| Pod hooks | Unit | Test runner + hook harness | `component-patterns.md` |
| Critical flow through a Container | Flow | View renderer + HTTP interception | `container-integration.md` |
| Critical journey in the browser | Flow | Browser runner | `container-integration.md` |

Test pyramid:

```
         /\
        /Flows\        ← Container + HTTP interception, or browser runner — critical flows only
       /──────\
      /  Unit  \       ← Test runner — business logic: hooks, repositories, mappers, pure utils
     /__________\
```

## Execution Steps

1. Choose level and tool with the Decision Gates table.
2. Load the reference the table indicates.
3. Write the test following the Hard Rules.

## Output Contract

Tests at the level and with the tool the Decision Gates table sets, with none of the anti-patterns in the Hard Rules.

## References

- [`references/component-patterns.md`](references/component-patterns.md) — Read `references/component-patterns.md` for the patterns of unit tests (mappers, hooks).
- [`references/container-integration.md`](references/container-integration.md) — Read `references/container-integration.md` for critical flow tests with HTTP interception and browser tests.
- [`references/docs.md`](references/docs.md) — Read `references/docs.md` for related skills, ADRs and internal documentation.
- Load the project's stack skill for tests (`stack-vitest`) and read its `references/client-testing.md`.
- Load the project's stack skill for server state (`stack-tanstack-query`) and read its `references/client-testing.md`.
