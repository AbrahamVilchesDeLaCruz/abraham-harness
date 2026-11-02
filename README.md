# abraham-harness

My meta-harness: one versioned set of agent skills and architecture conventions, shared by all my projects.

- **Architecture:** NestJS with DDD and hexagonal architecture for APIs, and React with pods and Container-Presentational for clients.
- **Agents:** Any agent supported by the [`skills` CLI](https://github.com/vercel-labs/skills), such as Claude Code, Codex and OpenCode.
- **Distribution:** This GitHub repository. There is no npm package to publish.

## Start a project

1. Install the skills in the project:

   ```bash
   npx skills@latest add AbrahamVilchesDeLaCruz/abraham-harness
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
npx skills check    # exits with code 1 when an update is available
npx skills update   # installs the latest version of the skills
```

## Change a convention

Edit shared skills here, never in the generated skills directory of a project. See [AGENTS.md](AGENTS.md).

## Skills

| Group | Skills |
| --- | --- |
| Project | `project-bootstrap` |
| Workflow | `tdd-workflow`, `git-workflow`, `skill-creator`, `skill-sync` |
| API | `api-application`, `api-auth`, `api-bc-review`, `api-criteria`, `api-di`, `api-domain`, `api-domain-events`, `api-error-handler`, `api-events`, `api-events-infra`, `api-infrastructure`, `api-migrations`, `api-observability`, `api-response`, `api-rest`, `api-shared`, `api-testing`, `api-validation` |
| Client | `client-api`, `client-container-presentational`, `client-hooks`, `client-pods`, `client-query`, `client-testing` |

## License

[Apache-2.0](LICENSE)
