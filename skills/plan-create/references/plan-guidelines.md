# Plan guidelines

## Public contracts

For each phase, list what is created, changed or deleted:

| Contract | Detail to agree on |
| --- | --- |
| Application services (use cases) | Each method signature |
| Domain events | Each attribute |
| Test suites | Every test case |
| Database schemas | Each table |
| User-facing text | The exact copy in the UI or emails |

## Vertical slices

A vertical slice delivers one working behavior end to end.

- Wrong: the controller in Phase 1 and the service it calls in Phase 2.
- Wrong: the UI handler in Phase 1 and the endpoint it calls in Phase 2.
- Right: the happy path of an edit form in Phase 1, with its component, backend logic, schema and tests. Validation comes in Phase 2.
- Right: "mark as favorite" with its tests in Phase 1, then "suggest from favorites" in Phase 2.

Do not mix responsibilities in one phase. For example, add required dependencies in a separate phase from the first use case.

## Sections

- **Goal:** 1 to 3 sentences.
- **Context:** links to the relevant files, and the docs that apply.
- **Phases:** a short description and a to-do checklist.
- **Next step:** one sentence that names the next phase.
