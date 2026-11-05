# abraham-harness

My meta-harness: one versioned set of agent skills and architecture conventions, shared by all my projects.

- **Architecture:** DDD and hexagonal architecture for APIs, and pods with Container-Presentational for clients.
- **Stacks:** Concept skills name no framework. Stack skills map them to NestJS, TypeORM, RabbitMQ, Pino, Prometheus, OpenTelemetry, React, TanStack Query, Vitest and Playwright, with no pinned versions.
- **Agents:** Claude Code, Codex and OpenCode. The installer wraps the [`skills` CLI](https://github.com/vercel-labs/skills), which you can also call directly to target other agents.
- **Distribution:** This GitHub repository. There is no npm package to publish.

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

`update` updates installed skills and adds newly published harness skills that are not already present, without passing existing skill names to the add command. It also refreshes generated agents. In `AGENTS.md`, it refreshes only the skills tables between the `abraham-harness` markers, so your stack, your rules and your `## Project Skills` table stay yours. A project created before these markers existed is reported and left unchanged: run `/project-bootstrap` to add them. `check` reports both installed-skill updates and skills newly added to the harness catalog.

It also refreshes `make/local.mk`, `dev.mk`, `prod.mk` and `code.mk`, so every project has the same commands. It never touches the root `Makefile` or `make/project.mk`, and it keeps and reports a module you edited by hand.

Run these commands in each project:

```bash
npx github:AbrahamVilchesDeLaCruz/abraham-harness check    # exits with code 1 when an update is available
npx github:AbrahamVilchesDeLaCruz/abraham-harness update   # installs the latest version of the skills
```

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
| `coordinator` (orchestrating session) | Decomposes work, dispatches builders, integrates commits and runs seam checks | Integration workspace |
| `builder` | Implements one contracted task, runs its checks and commits locally on its assigned task branch | Yes |
| `security` | Reviews security | No |
| `ux` | Reviews flows, states, messages and accessibility | No |
| `ui` | Reviews visual consistency and layout | No |
| `code-reviewer` | Reviews correctness, architecture and tests | No |
| `approver` | Synthesizes the selected reviewers' verdicts for the same frozen integration commit | No |

## Workflow

The `factory-workflow` skill gives every request one lane:

| Lane | Use | What happens |
| --- | --- | --- |
| Answer | Questions, audits and proposals | Nothing is written |
| FTD | Ordinary change, the default | Feature document, contracted task(s), integration and applicable gate |
| SDD | Several decisions that affect each other, or work too large to resume from the request and `git diff` | Spec and plan; one phase at a time, with independent tasks parallelized when isolated, then integrated and gated |

The SDD flow:

```text
                        Brain: the project docs/, and Engram when available

Spec writer -> Coordinator decomposes phase into task contracts
                           |
             Builders in isolated branches/worktrees (parallel when independent)
                           |
             Coordinator integrates, resolves conflicts, runs seam checks
                           |
             Relevant reviewers (in parallel) -> Approver -> User delivers
```

Every code candidate is integrated and passes explicit seam checks before review. The coordinator chooses reviewers from the change surfaces and risk matrix; one missing, blocked or negative required verdict rejects the candidate and sends findings to the affected task(s). Any change creates a new candidate and invalidates prior verdicts. The coordinator may create local task and integration commits; you control publication or final merge. The flow stops after each phase.

Parallel builders require separate writable worktrees and branches. Runtime-specific capability notes live in `skills/factory-workflow/references/adapters/`; edit limits and path instructions are not a sandbox. If the runtime cannot provide verifiable isolation, tasks run serially in one workspace. Agent responsibilities are runtime-neutral; optional model assignments belong in project/runtime configuration, not the common workflow.

`install` adds the agents and `update` refreshes the generated ones that exist, in the project and in your home directory. Neither overwrites a file you wrote by hand.

## Conventions and docs

Shared conventions live only in the skills, so `update` keeps every project current. A project's `docs/` holds what belongs to that project: its domain and its decisions. The `doc-create` skill turns your corrections into documents there.

## Skills for one project

A skill that only one project needs lives in that project, in `skills/{name}/`. Install it with `npx skills@latest add ./skills/{name} -a claude-code -a codex -a opencode -y`, and `skill-sync` lists it in the `## Project Skills` table of `AGENTS.md`. Run the `add` command again after you change it.

## Commands

Every project has the same commands. Run `make` to see them.

```bash
make local      # start the whole stack in Docker. Also: make dev, make prod
make local-down # stop it. Also: -logs and -status
make test       # also: test-e2e, lint, format and typecheck
```

Add a project's own commands to `make/project.mk`.

## Change a convention

Edit shared skills here, never in the generated skills directory of a project. See [AGENTS.md](AGENTS.md).

## Skills

| Group | Skills |
| --- | --- |
| Project | `project-bootstrap`, `factory-workflow`, `plan-create`, `plan-phase-implement`, `doc-create`, `engineering-conventions`, `makefile` |
| Workflow | `tdd-workflow`, `git-workflow`, `skill-creator`, `skill-sync` |
| API | `api-application`, `api-auth`, `api-bc-review`, `api-criteria`, `api-di`, `api-domain`, `api-domain-events`, `api-error-handler`, `api-events`, `api-events-infra`, `api-infrastructure`, `api-migrations`, `api-observability`, `api-repository`, `api-response`, `api-rest`, `api-shared`, `api-testing`, `api-validation` |
| Client | `client-accessibility`, `client-api`, `client-branding`, `client-container-presentational`, `client-hooks`, `client-pods`, `client-query`, `client-testing`, `client-ui-design`, `client-ux` |
| Stack | `stack-nestjs`, `stack-typeorm`, `stack-rabbitmq`, `stack-observability`, `stack-react`, `stack-tanstack-query`, `stack-vitest` |

## Credits

The plan skills follow the approach of [Codely's Agent Harness](https://github.com/CodelyTV/agent-harness), and the lanes follow [rsc-harness](https://github.com/ericrisco/rsc-harness). Both are written here in my own words.

## License

[Apache-2.0](LICENSE)
