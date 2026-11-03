# abraham-harness

This repository is the source of truth for the skills and conventions that my projects install.

## Rules

- Every skill lives in `skills/{name}/`, and `name` in its frontmatter matches the directory.
- A skill is self-contained: installers copy one skill directory, so links must not leave it.
- Skills contain no details from a real project. Examples use the neutral `product`, `order` and `payment` domain and the `myapp` namespace.
- Agents use the session's model. There is no assignment of a model per role.
- Skills are in English.
- Concept skills (`api-*`, `client-*`) name no framework, and framework details go to `skills/stack-*/references/{concept-skill}.md`. Stack skills pin no version.
- Project templates live in `skills/project-bootstrap/assets/`, and shared conventions in `skills/engineering-conventions/`. Never make a project copy shared conventions.

## Change a Makefile module

After changing a file in `skills/makefile/assets/make/`, run `node scripts/stamp-make.mjs`, because `update` uses the stamp to detect hand edits.

## Change a skill

1. Edit the skill, or use `skill-creator` to add one.
2. When you add a skill, add it to the `README.md` table and to the matching `AGENTS.*.template.md`.
3. Run `npm test`.
4. Add an entry to `CHANGELOG.md`, bump `version` in `package.json`, and tag the release as `vX.Y.Z`.
