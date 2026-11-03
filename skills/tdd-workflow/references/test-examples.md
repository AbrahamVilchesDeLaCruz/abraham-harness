# tdd-workflow — Shape of the RED test

The code of these examples depends on the test runner, so it lives in the stack skill that matches the project's stack table: read its `references/engineering-tdd-workflow.md`.

**In api, one unit test file per use case, in `test/{bc}/{module}/application/{action}/{use-case}.spec.ts`:**

- A test named `should {expected behavior in business language}`:
  - Arrange: build the data with Object Mothers.
  - Act: execute the use case with the request.
  - Assert: verify the observable effect, not the internal implementation.
- A test named `should throw {DomainError} when {condition}`: execute the use case with invalid input, expect that domain error, and verify that the repository saved nothing.

**In client, one test file per component:**

- A test named `should {expected behavior}`: render the component with its props, and verify what the user sees (for example, a `submit` button).
