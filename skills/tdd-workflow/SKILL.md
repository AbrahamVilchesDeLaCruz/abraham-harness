---
name: tdd-workflow
description: "Trigger: Before implementing any new feature, use case, hook or component. Mandatory TDD workflow before writing any new code: Red → Green → Refactor. Applies to api and client."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

Load this skill BEFORE writing any new code:

- New use case or domain service (api)
- New aggregate or value object (api)
- New pod hook (client)
- New Container or Component (client)
- New mapper, helper or utility function (api or client)

**Does NOT apply to**: configuration changes, migrations, pure refactors with no new behavior.

## Hard Rules

- **The test is written first**. Always. There is no exception.
- **One test = one observable behavior**. Do not test internal implementation (`calls repository.match`), test the effect (`saves the product`).
- **The name describes the behavior**: `it('throws ProductNotFound when product does not exist')`, not `it('calls repository.match')`.
- **Verify that the test fails before implementing**: a test that never fails proves nothing.
- **Always use Object Mothers** to build test data. Never inline literals.
- **Do not mock what you do not control**: use your own abstractions instead of mocking `Date` or `Math.random` directly.
- This skill defines **WHEN and IN WHAT ORDER**: it always comes first.

## Decision Gates

What to test per layer:

| Layer | What to test |
|---|---|
| Use Case (api) | Full flow: happy path + domain errors |
| Domain Service (api) | Isolated business behavior |
| Pod hook (client) | State, handlers, side effects |
| Mapper (api/client) | Input → output transformation (pure function) |
| Component (client) | Rendering, UI interactions |
| Container (client) | Full flow with mocked HTTP |

**The Domain (aggregates, VOs) is not tested in isolation**: it is exercised through the tests of the Use Case that invokes it.

Other skills and tools:

| Need | Action |
|---|---|
| **HOW** to create Mothers, mocks and the `/test` structure in api | Load `api-testing` |
| **HOW** to test hooks, rendering and mocked HTTP in client | Load `client-testing` |
| Which tool tests each layer, and the RED test in that tool | Load the stack skill that matches the project's stack table, and read its `references/engineering-tdd-workflow.md` |

## Execution Steps

Always in this order:

1. **Understand what will be built.** Before writing a single line, answer:
   1. What new behavior are we adding? (in business language, not technical language)
   2. In which layer does it live? (domain, application, infrastructure, client-hook, client-component)
   3. What are the happy path scenarios and the error cases?
2. **RED: write the failing test**, before the implementation. Shape of the test in [`references/test-examples.md`](references/test-examples.md). **Verify that the test fails**: run the test and confirm that the error is the expected one (not found, not implemented), not a syntax or import error.
3. **GREEN: the minimum code to pass the test.** Write **only what is necessary** for the test to pass. No optimizing. No anticipating future cases.
   - If the implementation file has to be created, create it now.
   - If the test asks for a `ProductMother` that does not exist, create it too.
   - Do not add logic that the test does not demand yet.
4. **Refactor: clean up while staying green.** With the test green:
   - Remove duplication
   - Rename for clarity
   - Extract methods if the method does more than one thing
   - **The tests must stay green** after each change
5. **Repeat for each scenario.** Go back to step 2 for the next scenario. One Red → Green → Refactor cycle per behavior.

## Output Contract

For each behavior: a test observed failing with the expected error, the minimum code that makes it pass, and a clean refactor with the tests still green.

## References

- [`references/test-examples.md`](references/test-examples.md): shape of the RED test.
- Read [`references/docs.md`](references/docs.md) for related skills, ADRs and external documentation.
