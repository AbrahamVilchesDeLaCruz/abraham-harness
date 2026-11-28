# Changelog

This project follows [Semantic Versioning](https://semver.org/): a major version changes a convention that existing projects must adapt to (before 1.0, a minor version may do so), a minor version adds skills or guidance, and a patch version fixes them.

## 0.27.0

- Keep product decisions human-led and run the technical phases autonomously, including scoped isolated work, recovery and final review of the accumulated feature.
- Publish the first verified feature commit when authorized and deliver one final PR with task-specific evidence and visible CI status.
- Replace model approval synthesis with deterministic candidate validation, tighten reviewer permissions and document runtime-specific isolation checks.
- Pin the installer and harness catalog to the same release, add per-runtime diagnostics, and preserve fenced examples and line endings during managed documentation updates.
- Correct the messaging, seed, migration and logging references and permit focused integration tests for risks that need real dependencies.

## 0.26.0

- Add the self-contained Archify diagramming skill and use it for architect domain-model artifacts while preserving the existing approval and review flow.

## 0.25.1

- Ask about a domain diagram only after briefly reporting detected domain changes; invoke `architect` and build HTML only after an explicit yes. A no continues without diagram work.

## 0.25.0

- Add an optional `architect` role that produces a reviewable, navigable domain model HTML before specification and carries accepted aggregate, Value Object and language decisions through phase handoffs.
- Keep TDD behavior-focused while grouping equivalent cases; select one primary client flow level per risk and test independent client decisions rather than every mapper or hook by default. Keep repositories behind controller E2E.
- Default CI to PR-only with fast checks before costly suites, desktop and phone browser journeys, and global 80% coverage thresholds for branches, functions, lines and statements in API and client. Project-specific verification policy remains authoritative.

## 0.24.0

- Make each project's verification policy authoritative over shared local full-suite defaults, including in plans, task contracts, builder checks and reviews.
- Define the final feature candidate as the last candidate of the whole feature, not the end of each SDD phase; avoid automatic full local suites or early CI for intermediate phases when the project does not require them.
- Expand the README into a map of installation, discovery, FTD/SDD, worktrees, verification, review, publication and convention ownership.

## 0.23.0

- Keep focused unit tests during implementation and run the full unit suite locally at final or high-risk candidates; reserve routine E2E for candidate-branch/PR CI.
- Require passing full unit and E2E CI on the exact candidate before release/main merge or deployment, and before parent integration for independently published or high-risk phases.
- Keep `make test-e2e` available as the CI entry point and for targeted local diagnosis; record local and CI evidence separately in phase ledgers.
- Existing projects must configure their project-owned CI to run the root full-test command on candidate branches or PRs; `update` does not rewrite CI workflows or package scripts.

## 0.22.0

- Run affected-module and seam checks at intermediate integration, and reserve the full unit and E2E suite for the final feature candidate, independently published phases and high-risk phases.
- Add a per-phase command and elapsed-time ledger; let code reviewers inspect evidence and run focused tests instead of repeating the entire suite by default.
- Define `make test-e2e` as a delegate to the root E2E orchestrator, with API Compose and client journeys configured by project bootstrap; keep the API package script runner-only.

## 0.21.0

- Add `harness-update` to refresh and verify existing project installations while preserving project-owned files and reconciling legacy managed files.
- Make `update` install missing generated agent roles in runtimes that already use harness agents; leave hand-written agents and uninstalled runtimes untouched.
- Keep project updates within the project scope; global agent files change only with `--global`.
- Align the bootstrap TDD description with the existing behavior-focused test policy.

## 0.20.0

- Add task-proportional discovery, an opt-in A/B/C interview and a separate choice between a navigable HTML prototype and creative freedom before frontend specification.
- Carry one source-linked discovery/design handoff into specs and task contracts, with readable snapshots for isolated worktrees, so builders avoid repeated exploration while reviewers remain independent.
- Strengthen brand and visual-reference guidance, and clarify that test-first applies to observable behavior while presentation-only UI requires rendered, responsive and accessibility checks.
- Keep one default workflow with isolated worktrees, coordinator integration, mandatory code review, and the existing risk-based gates across Claude Code, Codex and OpenCode.

## 0.19.1

- Remove mandatory plan and product-decision approval pauses. Derive reasonable defaults from the request, document assumptions and ask only about consequential blockers.

## 0.19.0

- Permit necessary local task commits and worktree integration into the existing working branch as part of an implementation request; keep remote publication separately authorized.
- Add relational database design guidance and clarify manual migration creation.
- Require plan progress updates at integration and handoff, and omit agent co-author trailers from commits.

## 0.18.0

- Define a two-level test policy for the api: a large unit layer tested only from `application` (use cases and event subscribers, with a faked event) and E2E tests for controllers only. There are no integration tests; persistence is exercised through controller E2E.
- Run E2E through a `Dockerfile` test target and `docker-compose.test.yml` with one test database for all suites, started before the first test. Unit tests run on the host while iterating, and in CI they run in the same compose run as the E2E. E2E files boot the app once (`beforeAll`) and share it across their tests.
- Narrow the client policy to unit tests of business logic and complete critical flows; presentational Components no longer get rendering tests.

## 0.17.0

- Stage verification in the task contract: iteration, early (risk-covering) and closing checks per builder, with the full slow suite run once by the coordinator in the seam checks.
- Pass resolved skills and a rule summary in the contract, prepare each worktree environment once, and allow cheaper task commits (`commit-msg` always, full lint once at integration).
- Require builders to stop their background processes before reporting, and the Claude Code adapter to cancel leftovers.

## 0.16.0

- Make visual critique mandatory in `client-ui-design`: a capture, critique and fix loop (at most three rounds) on real screenshots, with an explicit `visual inspection not run` report when no tool exists.
- Add a harness-owned motion reference and route Impeccable to the critique step and Emil Kowalski's skills to motion review, both still optional.

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
