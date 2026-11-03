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
- Never overwrite an existing file from the target layout without showing the difference and getting confirmation. The only exception is an `AGENTS.md` a CLI just generated (step 3).
- Product and domain examples in these assets (`product`, `order`, `payment`) illustrate the patterns. Do not create them in the project.
- Record project-specific decisions in `docs/adr/`. Change a shared convention in the `abraham-harness` repository so that every project receives it.
- The `Stack table` lists are the defaults. Update the project's copy when a project deliberately differs.

## Decision Gates

| Situation | Action |
| --- | --- |
| The project does not have that app | Skip the `apps/api` or `apps/client` file |
| The apps do not exist yet | Scaffold the code (step 2) |

## Execution Steps

1. **Collect the inputs and inspect the target.** Ask for the project name and a one-line description, whether it has both an API and a client, and its stack, suggesting the `Stack table` lists as the default. List the target layout files that already exist.
2. **Scaffold the apps that do not exist yet**, before adding files there: the CLIs refuse a non-empty directory. Follow `references/scaffold.md` in `stack-nestjs` and `stack-react`, then apply `linting.md` in `engineering-conventions`. For another stack, use its stack skill. Replace the `myapp` example namespace with the project name. Add the root `package.json` and workspace the project needs.
3. **Copy the `AGENTS.md` templates** from `assets/` to the target layout, applying the gates above. Replace `{{PROJECT_NAME}}` and `{{PROJECT_DESCRIPTION}}`, and write the stack in each `Stack table`. When a CLI generated an `AGENTS.md`, replace it with the template. Do not carry over promotion or third-party install instructions: keep only build or test notes that the project needs, under `## Framework Notes`, outside the markers.
4. **Create `CLAUDE.md` and the `docs/` skeleton.** `CLAUDE.md` has the single line `@AGENTS.md`. Copy `assets/docs-template/README.md` to `docs/`, replace `{{PROJECT_NAME}}` in it, and add the two `.gitkeep` folders.
5. **Add the Makefile**, following the `makefile` skill, and the root scripts `make/code.mk` calls.
6. **Check the result.** Confirm that no `{{` placeholder remains and that every skill listed in `AGENTS.md` exists in the project's skills directory (`.agents/skills/` or `.claude/skills/`).

## Output Contract

The project matches this target layout:

```
{project}/
├── AGENTS.md                  ← assets/AGENTS.root.template.md
├── CLAUDE.md                  ← contains only: @AGENTS.md
├── package.json, workspace    ← when the project needs them
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

- `assets/AGENTS.{root,api,client}.template.md`: `AGENTS.md` templates.
- `assets/docs-template/README.md`: the map of the project's `docs/`.
- `engineering-conventions`: the shared conventions, which stay in the skills.
- `references/scaffold.md` in `stack-nestjs` and `stack-react`: scaffolding guides.
