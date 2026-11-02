# abraham-harness

My meta-harness: one versioned set of agent skills and architecture conventions, shared by all my projects.

- **Architecture:** NestJS with DDD and hexagonal architecture for APIs, and React with pods and Container-Presentational for clients.
- **Agents:** Claude Code, Codex and OpenCode. The installer wraps the [`skills` CLI](https://github.com/vercel-labs/skills), which you can also call directly to target other agents.
- **Distribution:** This GitHub repository. There is no npm package to publish.

## Start a project

1. Install the skills in the project for Claude Code, Codex and OpenCode:

   ```bash
   npx github:AbrahamVilchesDeLaCruz/abraham-harness
   ```

2. Ask your agent to set up the project:

   ```text
   /project-bootstrap
   ```

   It adds the `AGENTS.md` files, the architecture docs and the scaffolding guides.

3. Commit the result, including `skills-lock.json`.

## Keep projects up to date

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

Install per project, which is the default. The `--global` option replaces any skill with the same name in `~/.claude/skills/` and `~/.config/opencode/skills/`.

## Role agents

The installer also adds these agents to `.claude/agents/`, `.codex/agents/` and `.opencode/agents/`. The `factory-workflow` skill coordinates them.

| Agent | Role | Can edit |
| --- | --- | --- |
| `spec-planner` | Writes the spec and the plan | Only `docs/specs/` |
| `builder` | Implements with tests first, and applies corrections | Yes |
| `security` | Reviews security | No |
| `ux` | Reviews flows, states, messages and accessibility | No |
| `ui` | Reviews visual consistency and layout | No |
| `code-reviewer` | Reviews correctness, architecture and tests | No |
| `approver` | Approves only when the four reviewers are positive on the same commit | No |

Edit limits are not a sandbox. Claude Code removes the edit tools and OpenCode denies edits, but read-only roles keep shell access to run `git` and tests. Claude Code can't limit `spec-planner` to `docs/specs/`, and Codex has no per-agent sandbox, so there these limits are only instructions.

`install` adds the agents and `update` refreshes the generated ones that exist, in the project and in your home directory. Neither overwrites a file you wrote by hand.

## Change a convention

Edit shared skills here, never in the generated skills directory of a project. See [AGENTS.md](AGENTS.md).

## Skills

| Group | Skills |
| --- | --- |
| Project | `project-bootstrap`, `factory-workflow` |
| Workflow | `tdd-workflow`, `git-workflow`, `skill-creator`, `skill-sync` |
| API | `api-application`, `api-auth`, `api-bc-review`, `api-criteria`, `api-di`, `api-domain`, `api-domain-events`, `api-error-handler`, `api-events`, `api-events-infra`, `api-infrastructure`, `api-migrations`, `api-observability`, `api-response`, `api-rest`, `api-shared`, `api-testing`, `api-validation` |
| Client | `client-api`, `client-container-presentational`, `client-hooks`, `client-pods`, `client-query`, `client-testing` |

## License

[Apache-2.0](LICENSE)
