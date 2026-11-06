# Changelog

This project follows [Semantic Versioning](https://semver.org/): a major version changes a convention that existing projects must adapt to (before 1.0, a minor version may do so), a minor version adds skills or guidance, and a patch version fixes them.

## 0.15.0

- Allow the coordinator to integrate worktree tasks into an explicitly authorized parent feature/fix branch and perform specifically authorized push/PR/merge operations; publication remains opt-in and bounded to named refs and conditions.
- Make target-project policy and direct user authorization outrank generic/global skill defaults. Apply issue, label, size and CI gates only from the target repository's actual policy.
- Document child-PR/worktree integration and add the scoped publication-authorization contract.

## 0.14.0

- Make `update` add newly published harness skills that are not present in the selected project/global scope; `check` now reports these additions as available updates.
- Add `api-repository` as the home for repository port, query-contract and persistence-adapter conventions; route bootstrap, domain, infrastructure and TypeORM guidance through it.

## 0.13.0

- Strengthen `client-ui-design` with design craft guidance for hierarchy, spacing rhythm, density, composition and visual inspection; document optional Taste, Impeccable, Emil, Figma and browser integrations.
- Add `client-ux` for user journeys and screen states, and `client-accessibility` for practical WCAG-informed automated and manual review.
- Align branding guidance and token templates, fix client bootstrap skill routing, and wire design/UX/accessibility skills into client reviewers and React stack references.

## 0.12.0

- Split phases into contracted tasks that can run in parallel on isolated branches and Git worktrees. Builders create local task commits; the coordinator integrates, resolves conflicts, runs seam checks and freezes the review candidate. The user controls publication and final merge.
- Select required reviewers by change surface and risk; the approver synthesizes only the selected verdicts for the same frozen integration commit.
- Keep runtime capability notes and optional model mappings outside the runtime-neutral workflow; use serial execution when isolated workspaces are unavailable.

## 0.11.0

- Keep domain repositories small: use `match(criteria)` for field-based searches instead of adding a finder method for each filter combination. The core contract includes `save`, `search`, `match` and `remove`.

## 0.10.0

- Add `client-ui-design`: rules for modern interfaces (hierarchy, responsive layout, states, motion, accessibility) built from the brand tokens.
- Add `client-branding`: it creates the brand brief in `docs/brand.md` and the design tokens in `apps/client/src/styles/brand.css`, so that all UI is built from them. The `ui` reviewer checks that the candidate uses the tokens.

## 0.9.0

- Save every objection to Engram when it is available: reviewer findings, approver rejections and user corrections.
- Read the project with CodeGraph when it is available, before shell commands.

## 0.8.0

- Scaffold with the official CLIs, and keep what they generate. Vitest replaces Jest and oxlint replaces ESLint. Remove `stack-jest`, and rename `eslint-prettier.md` to `linting.md`.
- API examples use `.js` import extensions, as the current NestJS template requires.
- Use the newest TypeScript each app's CLI accepts. `stack-nestjs` explains how to keep `nest build` working with TypeScript 7 for type checking.
- Add `makefile`: the same commands in every project. `update` refreshes the shared modules, and keeps and reports one edited by hand.

## 0.7.0

- Keep shared conventions only in the skills: add `engineering-conventions`, and stop copying them into a project's `docs/`.
- Add `doc-create`, which turns corrections into documents in the project's `docs/`. `project-bootstrap` creates its skeleton.
- `update` refreshes the skills tables between markers in `AGENTS.md`, and leaves everything else in the file alone. `skill-sync` lists a project's own skills in a separate table.
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
