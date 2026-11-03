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

`update` updates the skills and the generated agents. In `AGENTS.md`, it refreshes only the skills tables between the `abraham-harness` markers, so your stack, your rules and your `## Project Skills` table stay yours. A project created before these markers existed is reported and left unchanged: run `/project-bootstrap` to add them.

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

The installer also adds these agents to `.claude/agents/`, `.codex/agents/` and `.opencode/agents/`.

| Agent | Role | Can edit |
| --- | --- | --- |
| `spec-writer` | Writes the spec and the phased plan | Only `.agents/plans/` |
| `builder` | Implements one phase with tests first, stages it and never commits | Yes |
| `security` | Reviews security | No |
| `ux` | Reviews flows, states, messages and accessibility | No |
| `ui` | Reviews visual consistency and layout | No |
| `code-reviewer` | Reviews correctness, architecture and tests | No |
| `approver` | Approves only when the four reviewers are positive on the same staged tree | No |

## Workflow

The `factory-workflow` skill gives every request one lane:

| Lane | Use | What happens |
| --- | --- | --- |
| Answer | Questions, audits and proposals | Nothing is written |
| FTD | Ordinary change, the default | One feature document, the builder, then the gate |
| SDD | Several decisions that affect each other, or work too large to resume from the request and `git diff` | Spec, plan and one builder phase at a time, each with the gate |

The SDD chain:

```text
                        Brain: the project docs/, and Engram when available

Spec writer -> Builder -> Security, UX, UI, Code (in parallel) -> Approver
                  ^                                                  |
                  +------------------ on rejection ------------------+
```

Every code change passes this gate: one negative reviewer rejects the candidate, and it returns to the builder. After approval, the agent stops after each phase, and you commit.

Edit limits are not a sandbox. Claude Code removes the edit tools and OpenCode denies edits, but read-only roles keep shell access to run `git` and tests. Claude Code can't limit `spec-writer` to `.agents/plans/`, and Codex has no per-agent sandbox, so there these limits are only instructions.

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
| API | `api-application`, `api-auth`, `api-bc-review`, `api-criteria`, `api-di`, `api-domain`, `api-domain-events`, `api-error-handler`, `api-events`, `api-events-infra`, `api-infrastructure`, `api-migrations`, `api-observability`, `api-response`, `api-rest`, `api-shared`, `api-testing`, `api-validation` |
| Client | `client-api`, `client-container-presentational`, `client-hooks`, `client-pods`, `client-query`, `client-testing` |
| Stack | `stack-nestjs`, `stack-typeorm`, `stack-rabbitmq`, `stack-observability`, `stack-react`, `stack-tanstack-query`, `stack-vitest` |

## Credits

The plan skills follow the approach of [Codely's Agent Harness](https://github.com/CodelyTV/agent-harness), and the lanes follow [rsc-harness](https://github.com/ericrisco/rsc-harness). Both are written here in my own words.

## License

[Apache-2.0](LICENSE)
