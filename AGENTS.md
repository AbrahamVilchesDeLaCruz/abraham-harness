# abraham-harness

This repository is the source of truth for the skills and conventions that my projects install.

## Rules

- Every skill lives in `skills/{name}/`, and `name` in its frontmatter matches the directory.
- A skill is self-contained: installers copy one skill directory, so links must not leave it.
- Skills contain no details from a real project. Examples use the neutral `product`, `order` and `payment` domain and the `myapp` namespace.
- Project templates and architecture docs live in `skills/project-bootstrap/assets/`.

## Change a skill

1. Edit the skill, or use `skill-creator` to add one.
2. When you add a skill, add it to the `README.md` table and to the matching `AGENTS.*.template.md`.
3. Run `npm test`.
4. Add an entry to `CHANGELOG.md`, bump `version` in `package.json`, and tag the release as `vX.Y.Z`.
