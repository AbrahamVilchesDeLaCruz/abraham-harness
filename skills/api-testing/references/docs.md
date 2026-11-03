# api-testing — Docs & References

## Related Skills

| Skill | Why read it |
|---|---|
| `api-application` | Use cases — what is mainly tested |
| `api-domain` | Aggregates and VOs — to build the Object Mothers |
| `api-domain-events` | Domain Events — how to assert they were published |

## Available templates

- `assets/object-mother.template.md` — generic Object Mother template

## Test pyramid numbers (reference)

| Layer | Tests | Duration target |
|---|---|---|
| Unit (use case) | 2–5 per use case | < 50ms each |
| Unit (larger domain service tested on its own) | Few — only when it is worth it | < 1ms each |
| E2E (HTTP) | 1–2 per endpoint | < 2s each |

## Internal Docs

| Doc | Relevant content |
|---|---|
| `docs/engineering/testing.md` | How to run tests in the monorepo, the project's real pyramid, commands |
| `docs/engineering/engineering-principles.md` | Why test behavior, not implementation (TDD, dependency inversion) |
