# Changelog

This project follows [Semantic Versioning](https://semver.org/): a major version changes a convention that existing projects must adapt to (before 1.0, a minor version may do so), a minor version adds skills or guidance, and a patch version fixes them.

## 0.7.0

- Keep shared conventions only in the skills: add `engineering-conventions`, and stop copying them into a project's `docs/`.
- Add `doc-create`, which turns corrections into documents in the project's `docs/`. `project-bootstrap` creates its skeleton.
- Use case tests are unit tests that mirror `src` under `test`, with `request-{use-case}.mother.ts` and `{use-case}.spec.ts`.
- Each submodule exports its exception registry, and only the shared modules of bounded contexts reach the root shared module.
- Pods flow from Container through hooks, repository and API client to the Component. Add the pod repository.

## 0.6.0

- Rename `spec-planner` to `spec-writer`.
- Remove `finding-verifier`: one negative reviewer rejects the candidate, and the work returns to the builder.
- Add the Brain: every role reads the project's `docs/` conventions, and Engram when it is available.
- Send large work to SDD: work that could not be resumed from the request and `git diff` alone.
- Remove generated agents of retired roles on install and update.
- Settle rules across skills: HTTP status codes, `page` and `pageSize`, the error registry, domain services in `domain`, domain tests through use cases, Object Mother location, the pod root `pods/{pod-name}`, the mapper in the pod root, and pod hooks.
- Use camelCase for API fields, TypeScript fields and event payloads. SQL columns, queue names and Prometheus metrics keep snake_case.
- Every hook returns an object with named fields, also when it exposes state.

## 0.5.0

- Translate every skill to English.
- Separate concepts from frameworks: `api-*` and `client-*` name no framework, and 8 new `stack-*` skills map them to each framework with no pinned versions.
- Keep every concept: DDD, hexagonal architecture, ports and adapters, use cases, domain services, value objects, domain events, domain errors and Object Mothers.

## 0.4.0

- Add `plan-create` and `plan-phase-implement`: agreed contracts, vertical slices, one phase per invocation and no automatic commits.
- Rewrite `factory-workflow` around three lanes: Answer, FTD and SDD.
- Add `finding-verifier`, which tries to refute blocking findings before they count.
- Review the staged tree instead of a commit, because the builder no longer commits.

## 0.3.0

- Add role agents for Claude Code, Codex and OpenCode: `spec-planner`, `builder`, `security`, `ux`, `ui`, `code-reviewer` and `approver`.
- Add `factory-workflow`, which coordinates the agents. The approver needs four positive reviews on the same commit.
- Restructure every skill for lower context cost: `SKILL.md` bodies are about 38% smaller, and long examples moved verbatim to `references/`.
- Validate skill structure, size budget and encoding.
- Replace source-project terms in skill examples with the neutral domain.

## 0.2.0

- Add an installer that targets Claude Code, Codex and OpenCode: `npx github:AbrahamVilchesDeLaCruz/abraham-harness`.

## 0.1.0

- Add API skills for NestJS with DDD and hexagonal architecture.
- Add client skills for React with the pods and Container-Presentational patterns.
- Add workflow skills: `tdd-workflow`, `git-workflow`, `skill-creator` and `skill-sync`.
- Add `project-bootstrap`, which installs the `AGENTS.md` templates and architecture docs in a project.
- Add a skill validator and CI.
