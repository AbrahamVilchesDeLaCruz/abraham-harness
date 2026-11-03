# tdd-workflow — Docs & References

## Related Skills

| Skill | Why read it before running TDD |
|---|---|
| `api-testing` | Pyramid, Object Mothers, port mocks |
| `api-domain` | Aggregate and VO templates: what the red test exercises through the use case |
| `api-application` | Use case template: what the unit tests exercise |
| `client-testing` | Rendering, hook tests, mocked HTTP: TDD on the client |

## External Documentation

- [Test-Driven Development by Example (Beck)](https://www.oreilly.com/library/view/test-driven-development/0321146530/) — the foundational book
- [Growing Object-Oriented Software Guided by Tests (Freeman & Pryce)](https://www.pearson.com/en-us/subject-catalog/p/growing-object-oriented-software-guided-by-tests/P200000009397) — outside-in TDD
- [Kent Beck — TDD](https://medium.com/@kentbeck_7670/test-driven-development-by-example-a-chapter-b9e42f8bc0ba) — article by the author

Test runner documentation lives in the stack skills: `references/engineering-tdd-workflow.md`.

## Red → Green → Refactor cycle

```
RED:     Write the minimal failing test
          → run: pnpm test --watch

GREEN:   Write the minimal code to make it pass
          → no optimizations yet, just make it green

REFACTOR: Clean up without breaking tests
          → extract, rename, simplify — tests must stay green
          → commit after each successful refactor step
```

## TDD in this project

- **api**: `pnpm --filter @myapp/api test --watch`
- **client**: `pnpm --filter @myapp/client test --watch`

## Internal Docs

| Doc | Relevant content |
|---|---|
| `docs/engineering/testing.md` | How tests run in the monorepo: real commands for the Red→Green→Refactor cycle |
| `docs/engineering/engineering-principles.md` | Why TDD: fast feedback, test-guided design, dependency inversion |
