---
name: project-bootstrap
description: "Trigger: When starting a new project, or when aligning an existing project with the shared architecture. Sets up a project with the abraham-harness architecture: AGENTS.md files, the docs/ skeleton and scaffolding."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

- Starting a new project that follows the shared architecture
- Aligning an existing project with it

## Hard Rules

- Keep the `abraham-harness` markers in `AGENTS.md`: `update` refreshes the tables between them, and never changes anything else.
- Do not copy shared conventions into the project. They live in the skills, and `update` keeps them current.
- When a CLI generates an `AGENTS.md`, use this skill's template, and append that content under `## Framework Notes`, outside the markers.
- Never overwrite an existing file from the target layout without showing the difference and getting confirmation.
- Product and domain examples in these assets (`product`, `order`, `payment`) illustrate the patterns. Do not create them in the project.
- Record project-specific decisions in `docs/adr/`. Change a shared convention in the `abraham-harness` repository so that every project receives it.
- The `Stack table` lists are the defaults. Update the project's copy when a project deliberately differs.

## Decision Gates

| Situation | Action |
| --- | --- |
| The project does not have that app | Skip the `apps/api` or `apps/client` file |
| The apps do not exist yet | Scaffold the code (step 7) |

## Execution Steps

1. **Collect the inputs.** Ask for the project name and a one-line description if they are not known yet. Ask whether the project has both an API and a client.
2. **Inspect the target.** List the files from the target layout that already exist.
3. **Copy the assets.** Copy them from this skill's `assets/` directory to the paths in the target layout, applying the gates above.
4. **Fill the placeholders.** Replace `{{PROJECT_NAME}}` and `{{PROJECT_DESCRIPTION}}` in every copied `AGENTS.md`, and `{{PROJECT_NAME}}` in `docs/README.md`.
5. **Fill the stack table.** Ask for the project's stack, offering the values in the `Stack table` lists as the default suggestion. Write the answer in the `Stack table` of every copied `AGENTS.md`.
6. **Create `CLAUDE.md`** with the single line `@AGENTS.md`.
   Then add the Makefile, following the `makefile` skill.
7. **Scaffold the code when the apps do not exist yet.** Follow `references/scaffold.md` in the `stack-nestjs` and `stack-react` skills, then apply `linting.md` in `engineering-conventions`. For another stack, use the stack skill that matches the stack table. Replace the `myapp` example namespace in these guides with the project name.
8. **Check the result.** Confirm that no `{{` placeholder remains and that every skill listed in `AGENTS.md` exists in the project's skills directory (`.agents/skills/` or `.claude/skills/`).

## Output Contract

The project matches this target layout:

```
{project}/
├── AGENTS.md                  ← assets/AGENTS.root.template.md
├── CLAUDE.md                  ← contains only: @AGENTS.md
├── Makefile, make/            ← from the makefile skill
├── apps/
│   ├── api/AGENTS.md          ← assets/AGENTS.api.template.md
│   └── client/AGENTS.md       ← assets/AGENTS.client.template.md
├── docs/
│   ├── README.md              ← assets/docs-template/README.md: the Brain's map
│   ├── domain/.gitkeep        ← keeps the empty folder in git, filled with doc-create
│   └── adr/.gitkeep           ← keeps the empty folder in git, filled with doc-create
└── .agents/skills/            ← installed by npx skills (.claude/skills for Claude Code only), never edited by hand
```

## References

- [`assets/AGENTS.root.template.md`](assets/AGENTS.root.template.md), [`assets/AGENTS.api.template.md`](assets/AGENTS.api.template.md), [`assets/AGENTS.client.template.md`](assets/AGENTS.client.template.md): `AGENTS.md` templates.
- [`assets/docs-template/README.md`](assets/docs-template/README.md): the map of the project's `docs/`.
- `engineering-conventions`: the shared conventions, which stay in the skills.
- `references/scaffold.md` in `stack-nestjs` and `stack-react`: scaffolding guides.
