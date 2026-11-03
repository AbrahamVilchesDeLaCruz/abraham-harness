---
name: engineering-conventions
description: "Trigger: When you need the shared architecture, engineering principles, testing, git or linting conventions behind the other skills. Index of the conventions that every project shares."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

Use this skill when a task needs the reasoning behind a convention, or a convention that no narrower skill covers. Prefer the narrower skill when one applies.

## Hard Rules

- Read only the reference your task needs.
- These conventions are shared. Never copy them into a project's `docs/`, because a copy stops receiving updates.
- A project's `docs/` holds what belongs to that project. When a project deliberately differs from a convention, record the decision in its `docs/adr/`.
- Change a shared convention in the `abraham-harness` repository, so that every project receives it.

## Decision Gates

| You need | Read |
| --- | --- |
| Layers, ports and adapters, and bounded contexts | `references/backend-architecture.md` |
| Pods and the client data flow | `references/frontend-architecture.md` |
| Principles and code design | `references/engineering-principles.md` |
| The test pyramid and how to test | `references/testing.md` |
| Branches, commits and merging | `references/git-workflow.md` |
| Linting and formatting | `references/eslint-prettier.md` |

## References

- For framework details, read `references/engineering-*.md` in the project's stack skills.
