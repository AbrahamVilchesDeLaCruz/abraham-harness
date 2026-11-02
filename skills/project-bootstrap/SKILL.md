---
name: project-bootstrap
description: "Sets up a project with the abraham-harness architecture: AGENTS.md files, architecture docs and scaffolding guides. Trigger: When starting a new project, or when aligning an existing project with the shared architecture."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## When to Use

- Starting a new project that follows the shared architecture
- Aligning an existing project with it

## Target Layout

```
{project}/
├── AGENTS.md                  ← assets/AGENTS.root.template.md
├── CLAUDE.md                  ← contains only: @AGENTS.md
├── apps/
│   ├── api/AGENTS.md          ← assets/AGENTS.api.template.md
│   └── client/AGENTS.md       ← assets/AGENTS.client.template.md
├── docs/
│   ├── engineering/           ← assets/docs/engineering/
│   └── conventions/           ← assets/docs/conventions/
└── .agents/skills/            ← installed by npx skills (.claude/skills for Claude Code only), never edited by hand
```

## Steps

1. **Collect the inputs.** Ask for the project name and a one-line description if they are not known yet. Ask whether the project has both an API and a client.
2. **Inspect the target.** List the files from the target layout that already exist. Never overwrite one without showing the difference and getting confirmation.
3. **Copy the assets.** Copy them from this skill's `assets/` directory to the paths in the target layout. Skip the `apps/api` or `apps/client` file when the project does not have that app.
4. **Fill the placeholders.** Replace `{{PROJECT_NAME}}` and `{{PROJECT_DESCRIPTION}}` in every copied `AGENTS.md`. Replace the `myapp` example namespace in the copied docs with the project name.
5. **Create `CLAUDE.md`** with the single line `@AGENTS.md`.
6. **Scaffold the code when the apps do not exist yet.** Follow `docs/conventions/scaffold-nestjs.md` and `docs/conventions/scaffold-vite-react.md`, then apply `eslint-prettier.md` and `jest-esm.md`.
7. **Check the result.** Confirm that no `{{` placeholder remains and that every skill listed in `AGENTS.md` exists in the project's skills directory (`.agents/skills/` or `.claude/skills/`).

## Rules

- Product and domain examples in these assets (`product`, `order`, `payment`) illustrate the patterns. Do not create them in the project.
- Record project-specific decisions in `docs/adr/`. Change a shared convention in the `abraham-harness` repository so that every project receives it.
- The `Stack` tables are the defaults. Update the project's copy when a project deliberately differs.
