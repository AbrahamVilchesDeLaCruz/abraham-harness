# abraham-harness

My meta-harness: one versioned set of agent skills and architecture conventions, shared by all my projects.

- **Architecture:** DDD and hexagonal architecture for APIs, and pods with Container-Presentational for clients.
- **Stacks:** Concept skills name no framework. Stack skills map them to NestJS, TypeORM, RabbitMQ, Pino, Prometheus, OpenTelemetry, React, TanStack Query, Vitest and Playwright, with no pinned versions.
- **Agents:** Claude Code, Codex and OpenCode. The installer wraps the [`skills` CLI](https://github.com/vercel-labs/skills), which you can also call directly to target other agents.
- **Distribution:** This GitHub repository. There is no npm package to publish.

## Contents

- [Start a project](#start-a-project) · [Update an existing project](#keep-projects-up-to-date)
- [How the workflow runs](#workflow) · [Verification and CI](#verification-and-ci) · [Reviews and publication](#reviews-and-publication)
- [Where instructions live](#conventions-and-docs) · [Commands](#commands) · [Skills](#skills)

## Start a project

A new project needs both steps. The `npx` command installs the tools, and `/project-bootstrap` sets up the project.

1. Install the skills and agents for Claude Code, Codex and OpenCode, from the project's root:

   ```bash
   npx github:AbrahamVilchesDeLaCruz/abraham-harness#v0.27.0
   ```

   This creates `.agents/skills/`, `.claude/skills/`, the role agents and `skills-lock.json`. It does not create `AGENTS.md` or `docs/`.

2. Ask your agent to set up the project:

   ```text
   /project-bootstrap
   ```

   This creates `AGENTS.md` with the skills tables, `CLAUDE.md`, the `Makefile`, and the `docs/` skeleton. It asks for your stack, and scaffolds the apps with their official CLIs if they do not exist yet.

3. Commit the result, including `skills-lock.json`.

## Keep projects up to date

`update` reconciles wrapper-managed skills to the wrapper's exact release tag and adds newly published catalog names where no local override exists. It also refreshes generated roles in previously installed runtimes, marked `AGENTS.md` tables and existing managed Make modules. `check` compares against this particular wrapper release. Run `doctor --json` to see the release manifest, skill and role files by runtime, overrides and gaps. File presence does not verify effective runtime capabilities.

It also refreshes `make/local.mk`, `dev.mk`, `prod.mk` and `code.mk`, so every project has the same commands. It never touches the root `Makefile` or `make/project.mk`, and it keeps and reports a module you edited by hand.

Run these commands in each project:

```bash
npx github:AbrahamVilchesDeLaCruz/abraham-harness#v0.27.0 check    # exits with code 1 when an update is available
npx github:AbrahamVilchesDeLaCruz/abraham-harness#v0.27.0 update   # reconciles to the wrapper release
```

Run `update` once to receive the new `harness-update` skill. For later upgrades, ask your agent to use `harness-update` from the project root; it checks the installation, runs the updater, reconciles reported legacy files without replacing project-owned content, and verifies the result. Commit the resulting `skills-lock.json` and generated files after review.

After updating, check the project's own verification policy, root `test:e2e` script and CI workflow. The shared default runs complete checks on PRs only, with optional manual dispatch, before merge or deployment; no routine push trigger. The harness updater refreshes shared skills and managed files; it does not rewrite project-owned `docs/`, CI or package scripts. If a project reserves complete suites for CI, that project rule overrides the harness's optional local full-unit default. Do not copy shared conventions into project docs to make an exception: record the project's actual policy there.

## Where the skills go

| Agent | Project directory |
| --- | --- |
| Claude Code | `.claude/skills/` |
| Codex | `.agents/skills/` |
| OpenCode | `.agents/skills/` |

Install per project, which is the default and the intended use. The `--global` option exists, and it replaces any skill with the same name in your home directory.

## Role agents

The installer adds the specialist agents to `.claude/agents/`, `.codex/agents/` and `.opencode/agents/`. The coordinator is the primary/orchestrating session, not a generated subagent.

| Agent | Role | Can edit |
| --- | --- | --- |
| `spec-writer` | Writes the spec and the phased plan | Only `.agents/plans/` |
| `architect` | Optionally uses `archify` to create a reviewable domain model and glossary before specification | Only `.agents/plans/` |
| `coordinator` (orchestrating session) | Decomposes work, dispatches builders, integrates commits and runs seam checks | Integration workspace |
| `builder` | Implements one contracted task, runs its checks and commits locally on its assigned task branch | Yes |
| `security` | Reviews security | No |
| `ux` | Reviews flows, states, messages and accessibility | No |
| `ui` | Reviews visual consistency and layout | No |
| `code-reviewer` | Reviews correctness, architecture and tests | No |

## Workflow

The [factory workflow](skills/factory-workflow/SKILL.md) routes every request into one lane. The current primary session is the coordinator; it is not an installed role agent.

| Lane | Use | What happens |
| --- | --- | --- |
| Answer | Questions, audits and proposals | Read-only evidence and an answer |
| FTD | Change resumable from the request and diff | One feature document, task contracts, integration and applicable review gate |
| SDD | Interacting decisions or a longer change | Discovery, spec, phased plan, contracted tasks, phase integration and review |

### Before specification

For FTD and SDD, the coordinator follows [discovery](skills/factory-workflow/references/discovery.md) before specification or task contracts. Exploration depth follows the uncertainty, affected surfaces and risk of the request. One short, source-linked handoff records the current behavior, constraints and decisions.

When product choices are open, the coordinator asks about them together. A request with settled product decisions proceeds directly. When applicable, the coordinator separately offers a [domain diagram](skills/factory-workflow/references/domain-model.md) and a [frontend prototype](skills/factory-workflow/references/prototype.md) after the interview. Both require a user choice before production. The coordinator resolves ordinary technical decisions and only returns to the user if business outcomes, scope or authority need to change.

### From task to candidate

```text
Request → Answer | FTD | SDD
FTD/SDD → Explore → optional interview → optional domain model → optional frontend HTML prototype
SDD → Spec writer → phased plan → analyze gaps
Ready tasks → verified serial or isolated parallel execution → phase integration
Final feature diff → relevant reviewers → deterministic gate → authorized PR
```

The [FTD lane](skills/factory-workflow/references/ftd.md) holds a compact discovery, checklist, evidence and next step. The [SDD lane](skills/factory-workflow/references/sdd.md) uses a spec and [plan](skills/plan-create/SKILL.md) of usable vertical slices. Each phase gets an integrated candidate and seam checks. High-risk phases get early review. Only the last integrated candidate of the whole requested feature is the **final feature candidate**; ending an intermediate SDD phase does not turn it into the feature final.

The coordinator writes a [task contract](skills/factory-workflow/references/task-contract.md) with an immutable base, authorized paths, dependencies and exact checks. Builders commit only on their assigned branches and worktrees. Independent tasks may run in parallel only with verified workspace isolation; otherwise they run serially. Dependent tasks start from the integrated SHA that includes their prerequisites. The coordinator resolves conflicts, checks affected modules and their connections, and records a [phase check ledger](skills/factory-workflow/references/integration.md) with commands, scope, results and elapsed time. It does not replay every builder check on the combined tree.

There are no personal/professional profiles or hard-coded model assignments. The same flow scales exploration, test scope and reviewer selection to the task. Builders receive only task-relevant decisions and readable handoff/prototype snapshots in their worktrees. Runtime-specific worktree capabilities live in the [Claude Code](skills/factory-workflow/references/adapters/claude-code.md), [Codex](skills/factory-workflow/references/adapters/codex.md) and [OpenCode](skills/factory-workflow/references/adapters/opencode.md) adapters.

## Verification and CI

**The target project's `AGENTS.md`, `docs/engineering/` verification policy and CI rules take precedence over shared defaults.** Read them before assigning tests. A project that reserves complete suites for CI must not run them locally just because a shared skill mentions a full local gate. The plan, task contract, builder and reviewer all preserve that choice.

| Point in the flow | Shared default | If the project reserves full suites for CI |
| --- | --- | --- |
| Builder iteration | Test the changed behavior or module; apply [test-first](skills/tdd-workflow/SKILL.md) to new observable behavior | Same focused loop |
| Intermediate SDD phase | Test affected modules and their connections; build/typecheck and relevant lint/format | Same; a phase candidate is not the final feature candidate |
| Final feature candidate | Run the complete local unit suite once; also gate a separately published or high-risk phase as required | Keep local checks focused; record the complete suite as pending CI |
| Reviewer | Inspect the ledger independently and request focused tests for a concrete finding or risk | Same; do not repeat a full suite by default |
| PR CI | Typecheck, lint, complete API/client units with 80% global coverage per metric, then API and browser E2E; browser journeys run on desktop and phone | CI owns the complete suites |

The shared [test conventions](skills/engineering-conventions/references/testing.md) exercise distinct API domain decisions through application unit tests; API E2E checks HTTP, guards, critical persistence and wiring. Focused integration or contract tests cover distinct risks that need real dependencies. Client unit tests cover independent decisions in mappers, repositories and hooks; a critical journey uses Container with HTTP interception or a browser when real integration matters. The browser suite stays small and runs its selected journeys on desktop and phone. Routine E2E belongs in PR CI; a focused local E2E is a diagnostic only when the project policy allows it. A required CI check remains **pending** until it actually passes on the candidate. An independently published phase needs its own CI gate; a high-risk intermediate phase needs early CI when the project requires it. Review approval does not substitute for CI.

The shared `make test-e2e` target delegates to the project's root `test:e2e` script. The [bootstrap test runtime](skills/project-bootstrap/references/test-runtime.md) explains how that script orchestrates API Compose and client tests without recursion. Existing projects own their package scripts and CI workflows, so `update` does not change those files. CI triggered only after pushing to `main` cannot serve as a pre-merge gate.

## Reviews and publication

The [review matrix](skills/factory-workflow/references/review-matrix.md) selects reviewer roles by impact, including executable configuration. Review the accumulated feature diff on a frozen SHA. The bundled gate validates required roles, exact SHAs and local check evidence. A changed candidate requires fresh review. Retry interrupted reviews on the same SHA without spending a correction round.

[Publication authorization](skills/factory-workflow/references/publication-authorization.md) covers the feature branch, first push and final PR. Create or reuse the feature branch when implementation starts. When authorized, push its first verified commit, finish the technical phases and open one PR to the configured base with [task-specific evidence](skills/factory-workflow/references/pull-request.md). CI can be pending at human review. Required CI must pass before an authorized merge. Reconcile Markdown progress against Git and the PR host before resuming or retrying a remote write.

## Conventions and docs

Shared conventions live only in the skills, so `update` keeps every project current. A project's `docs/` holds what belongs to that project: its domain, decisions and verification policy. The [doc-create skill](skills/doc-create/SKILL.md) records project-specific corrections there. Do not edit a generated `.agents/skills/` or `.claude/skills/` directory to change a shared rule.

| Need | Source of truth |
| --- | --- |
| Agent routing, scoped stack and project exceptions | The project's root and app `AGENTS.md`, followed by its `docs/` |
| Discovery, FTD/SDD, task isolation, integration, review and delivery | [`factory-workflow`](skills/factory-workflow/SKILL.md) and its `references/` |
| API/client architecture, testing, lint and Git conventions | [`engineering-conventions`](skills/engineering-conventions/SKILL.md) and the matching concept skills |
| Framework and tool details | The relevant `stack-*` skill's `references/{concept-skill}.md` |
| New project layout and managed `AGENTS.md` blocks | [`project-bootstrap`](skills/project-bootstrap/SKILL.md) and its `assets/` |
| Existing project update and legacy reconciliation | [`harness-update`](skills/harness-update/SKILL.md) |
| Role responsibilities and review contracts | [`agents/`](agents/) |
| Install/update implementation and regression checks | [`bin/`](bin/), [`scripts/`](scripts/) and [`tests/`](tests/) |

## Skills for one project

A skill that only one project needs lives in that project, in `skills/{name}/`. Install it with `npx skills@latest add ./skills/{name} -a claude-code -a codex -a opencode -y`, and `skill-sync` lists it in the `## Project Skills` table of `AGENTS.md`. Run the `add` command again after you change it.

## Commands

The shared Makefile modules give projects common commands; a project's root scripts and `make/project.mk` define its environment-specific behavior. Run `make` to see the installed targets.

```bash
make local      # start the whole stack in Docker. Also: make dev, make prod
make local-down # stop it. Also: -logs and -status
make test       # run the project's unit-test script
make test-e2e   # delegate to the root full-test orchestrator, mainly for CI
make lint       # also: format and typecheck
```

Add a project's own commands to `make/project.mk`.

## Change a convention

Edit shared skills here, never in the generated skills directory of a project. Each skill is self-contained and in English; concept skills stay framework-neutral, while stack references hold framework details. After editing a skill, run `npm test`, update `CHANGELOG.md` and `package.json`, then tag a release. After changing `skills/makefile/assets/make/`, also run `node scripts/stamp-make.mjs`. See [AGENTS.md](AGENTS.md) for the repository rules.

## Skills

| Group | Skills |
| --- | --- |
| Project | `project-bootstrap`, `factory-workflow`, `plan-create`, `plan-phase-implement`, `doc-create`, `engineering-conventions`, `makefile` |
| Workflow | `archify`, `tdd-workflow`, `git-workflow`, `harness-update`, `skill-creator`, `skill-sync` |
| API | `api-application`, `api-auth`, `api-bc-review`, `api-criteria`, `api-database-design`, `api-di`, `api-domain`, `api-domain-events`, `api-error-handler`, `api-events`, `api-events-infra`, `api-infrastructure`, `api-migrations`, `api-observability`, `api-repository`, `api-response`, `api-rest`, `api-shared`, `api-testing`, `api-validation` |
| Client | `client-accessibility`, `client-api`, `client-branding`, `client-container-presentational`, `client-hooks`, `client-pods`, `client-query`, `client-testing`, `client-ui-design`, `client-ux` |
| Stack | `stack-nestjs`, `stack-typeorm`, `stack-rabbitmq`, `stack-observability`, `stack-react`, `stack-tanstack-query`, `stack-vitest` |

## Runtime pilot

Use an equivalent disposable project and the same base, scope and test policy in Claude Code, Codex and OpenCode. Measure one small fix, a change with a dependent task and a feature with independent tasks. For each eligible feature, run both serially and with isolated parallel writers. Record elapsed setup, execution, integration and CI time, available token counts, human interruptions, retries and evidence coverage in the PR. Use the same model where comparable and record provider and model otherwise.

Interrupt a run after its first feature push. Resume from the Markdown plan and observed Git and PR state. Verify the dependency base, reviewer access, final review SHA and that only one PR was opened. A fixture or generated configuration verifies mechanics; record live provider behavior separately.

## Credits

The plan skills and change-specific PR evidence draw on [Codely's Agent Harness](https://github.com/CodelyTV/agent-harness). The lanes and per-runtime diagnosis draw on [rsc-harness](https://github.com/ericrisco/rsc-harness). Coordinator recovery after worker exhaustion draws on [Gentle AI](https://github.com/Gentleman-Programming/gentle-ai/releases/tag/v4.6.0).

## License

[Apache-2.0](LICENSE)
