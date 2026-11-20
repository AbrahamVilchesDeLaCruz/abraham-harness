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
   npx github:AbrahamVilchesDeLaCruz/abraham-harness
   ```

   This creates `.agents/skills/`, `.claude/skills/`, the role agents and `skills-lock.json`. It does not create `AGENTS.md` or `docs/`.

2. Ask your agent to set up the project:

   ```text
   /project-bootstrap
   ```

   This creates `AGENTS.md` with the skills tables, `CLAUDE.md`, the `Makefile`, and the `docs/` skeleton. It asks for your stack, and scaffolds the apps with their official CLIs if they do not exist yet.

3. Commit the result, including `skills-lock.json`.

## Keep projects up to date

`update` updates installed skills and adds newly published harness skills that are not already present, without passing existing skill names to the add command. It refreshes generated agents and adds missing roles in runtimes where harness agents are already installed. In `AGENTS.md`, it refreshes only the skills tables between the `abraham-harness` markers, so your stack, your rules and your `## Project Skills` table stay yours. A project created before these markers existed is reported and left unchanged until its managed blocks are reconciled. `check` reports both installed-skill updates and skills newly added to the harness catalog.

It also refreshes `make/local.mk`, `dev.mk`, `prod.mk` and `code.mk`, so every project has the same commands. It never touches the root `Makefile` or `make/project.mk`, and it keeps and reports a module you edited by hand.

Run these commands in each project:

```bash
npx github:AbrahamVilchesDeLaCruz/abraham-harness check    # exits with code 1 when an update is available
npx github:AbrahamVilchesDeLaCruz/abraham-harness update   # installs the latest version of the skills
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
| `architect` | Optionally draws a reviewable domain model and glossary before specification | Only `.agents/plans/` |
| `coordinator` (orchestrating session) | Decomposes work, dispatches builders, integrates commits and runs seam checks | Integration workspace |
| `builder` | Implements one contracted task, runs its checks and commits locally on its assigned task branch | Yes |
| `security` | Reviews security | No |
| `ux` | Reviews flows, states, messages and accessibility | No |
| `ui` | Reviews visual consistency and layout | No |
| `code-reviewer` | Reviews correctness, architecture and tests | No |
| `approver` | Synthesizes the selected reviewers' verdicts for the same frozen integration commit | No |

## Workflow

The [factory workflow](skills/factory-workflow/SKILL.md) routes every request into one lane. The current primary session is the coordinator; it is not an installed role agent.

| Lane | Use | What happens |
| --- | --- | --- |
| Answer | Questions, audits and proposals | Read-only evidence and an answer |
| FTD | Change resumable from the request and diff | One feature document, task contracts, integration and applicable review gate |
| SDD | Interacting decisions or a longer change | Discovery, spec, phased plan, contracted tasks, phase integration and review |

### Before specification

For FTD and SDD, the coordinator follows [discovery](skills/factory-workflow/references/discovery.md) before specification or task contracts. Exploration depth follows the uncertainty, affected surfaces and risk of the request. One short, source-linked handoff records the current behavior, constraints and decisions.

The coordinator asks once whether you want an interview. If accepted, it presents one logical batch of up to ten useful A/B/C questions, with A recommended and preselected; it never silently submits A. You can accept the recommendations, change answers, skip questions or request another batch. If exploration finds a domain-model change, the coordinator briefly tells you what changes and asks whether you want a diagram. Only an explicit yes invokes `architect` to create a [navigable HTML model](skills/factory-workflow/references/domain-model.md) of aggregates, Value Objects, invariants and ubiquitous language; a no continues without diagram work. For frontend work with a material visual or interaction decision, it separately asks whether you want to review a [navigable HTML prototype](skills/factory-workflow/references/prototype.md) or grant creative freedom. Both HTML files are local decision artifacts, not production code. Accepted decisions enter the handoff before the spec writer starts. The interview and frontend prototype are coordinator stages; `architect` is an optional installed role.

### From task to candidate

```text
Request → Answer | FTD | SDD
FTD/SDD → Explore → optional interview → optional domain model → optional frontend HTML prototype
SDD → Spec writer → phased plan → analyze gaps
Current phase → task contracts → isolated builders → phase integration
Frozen candidate → relevant reviewers → approver → authorized delivery
```

The [FTD lane](skills/factory-workflow/references/ftd.md) holds a compact discovery, checklist, evidence and next step. The [SDD lane](skills/factory-workflow/references/sdd.md) uses a spec and [plan](skills/plan-create/SKILL.md) of usable vertical slices. Each phase gets its own integrated, frozen **phase candidate**. Only the last integrated candidate of the whole requested feature is the **final feature candidate**; ending an intermediate SDD phase does not turn it into the feature final.

The coordinator writes a [task contract](skills/factory-workflow/references/task-contract.md) with an immutable base, authorized paths, dependencies and exact checks. Builders commit only on their assigned branches and worktrees. Independent tasks may run in parallel only with verified workspace isolation; otherwise they run serially. The coordinator integrates task commits in dependency order, resolves conflicts, checks affected modules and their connections, and records a [phase check ledger](skills/factory-workflow/references/integration.md) with commands, scope, results and elapsed time. It does not replay every builder check on the combined tree.

There are no personal/professional profiles or hard-coded model assignments. The same flow scales exploration, test scope and reviewer selection to the task. Builders receive only task-relevant decisions and readable handoff/prototype snapshots in their worktrees. Runtime-specific worktree capabilities live in the [Claude Code](skills/factory-workflow/references/adapters/claude-code.md), [Codex](skills/factory-workflow/references/adapters/codex.md) and [OpenCode](skills/factory-workflow/references/adapters/opencode.md) adapters.

## Verification and CI

**The target project's `AGENTS.md`, `docs/engineering/` verification policy and CI rules take precedence over shared defaults.** Read them before assigning tests. A project that reserves complete suites for CI must not run them locally just because a shared skill mentions a full local gate. The plan, task contract, builder and reviewer all preserve that choice.

| Point in the flow | Shared default | If the project reserves full suites for CI |
| --- | --- | --- |
| Builder iteration | Test the changed behavior or module; apply [test-first](skills/tdd-workflow/SKILL.md) to new observable behavior | Same focused loop |
| Intermediate SDD phase | Test affected modules and their connections; build/typecheck and relevant lint/format | Same; a phase candidate is not the final feature candidate |
| Final feature candidate | Run the complete local unit suite once; also gate a separately published or high-risk phase as required | Keep local checks focused; record the complete suite as pending CI |
| Reviewer | Inspect the ledger independently and run focused tests for a concrete finding or risk | Same; do not repeat a full suite by default |
| PR CI | Typecheck, lint, complete API/client units with 80% global coverage per metric, then API and browser E2E; browser journeys run on desktop and phone | CI owns the complete suites |

The shared [test conventions](skills/engineering-conventions/references/testing.md) exercise distinct API domain decisions through application unit tests; API E2E checks HTTP, guards, critical persistence and wiring. Real repositories stay behind controller E2E. Client unit tests cover independent decisions in mappers, repositories and hooks; a critical journey uses Container with HTTP interception or a browser when real integration matters. The browser suite stays small and runs its selected journeys on desktop and phone. Routine E2E belongs in PR CI; a focused local E2E is a diagnostic only when the project policy allows it. A required CI check remains **pending** until it actually passes on the candidate. An independently published phase needs its own CI gate; a high-risk intermediate phase needs early CI when the project requires it. Review approval does not substitute for CI.

The shared `make test-e2e` target delegates to the project's root `test:e2e` script. The [bootstrap test runtime](skills/project-bootstrap/references/test-runtime.md) explains how that script orchestrates API Compose and client tests without recursion. Existing projects own their package scripts and CI workflows, so `update` does not change those files. CI triggered only after pushing to `main` cannot serve as a pre-merge gate.

## Reviews and publication

The coordinator chooses reviewers from the [review matrix](skills/factory-workflow/references/review-matrix.md). `code-reviewer` is mandatory for code changes; security, UX and UI join only when the actual diff touches their surfaces. Documentation/configuration-only changes skip the code gate. Reviewers inspect the same frozen candidate SHA; a missing or negative required verdict rejects it. A correction creates a new candidate and invalidates old verdicts. The `approver` verifies the selected verdict set; it does not replace a reviewer.

[Publication authorization](skills/factory-workflow/references/publication-authorization.md) separates local task integration from remote push, PR creation and merge. An implementation request permits local task commits and integration within its existing working branch, subject to project policy. Remote operations need user authorization for their target and action. Before a release/main merge or deployment, observe the required CI result on the candidate PR. Report a pending or missing check as pending, never as passed.

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
| Workflow | `tdd-workflow`, `git-workflow`, `harness-update`, `skill-creator`, `skill-sync` |
| API | `api-application`, `api-auth`, `api-bc-review`, `api-criteria`, `api-database-design`, `api-di`, `api-domain`, `api-domain-events`, `api-error-handler`, `api-events`, `api-events-infra`, `api-infrastructure`, `api-migrations`, `api-observability`, `api-repository`, `api-response`, `api-rest`, `api-shared`, `api-testing`, `api-validation` |
| Client | `client-accessibility`, `client-api`, `client-branding`, `client-container-presentational`, `client-hooks`, `client-pods`, `client-query`, `client-testing`, `client-ui-design`, `client-ux` |
| Stack | `stack-nestjs`, `stack-typeorm`, `stack-rabbitmq`, `stack-observability`, `stack-react`, `stack-tanstack-query`, `stack-vitest` |

## Credits

The plan skills follow the approach of [Codely's Agent Harness](https://github.com/CodelyTV/agent-harness), and the lanes follow [rsc-harness](https://github.com/ericrisco/rsc-harness). Both are written here in my own words.

## License

[Apache-2.0](LICENSE)
