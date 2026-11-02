# Changelog

This project follows [Semantic Versioning](https://semver.org/): a major version changes a convention that existing projects must adapt to, a minor version adds skills or guidance, and a patch version fixes them.

## 0.3.0

- Add role agents for Claude Code, Codex and OpenCode: `spec-planner`, `builder`, `security`, `ux`, `ui`, `code-reviewer` and `approver`.
- Add `factory-workflow`, which coordinates the agents. The approver needs four positive reviews on the same commit.

## 0.2.0

- Add an installer that targets Claude Code, Codex and OpenCode: `npx github:AbrahamVilchesDeLaCruz/abraham-harness`.

## 0.1.0

- Add API skills for NestJS with DDD and hexagonal architecture.
- Add client skills for React with the pods and Container-Presentational patterns.
- Add workflow skills: `tdd-workflow`, `git-workflow`, `skill-creator` and `skill-sync`.
- Add `project-bootstrap`, which installs the `AGENTS.md` templates and architecture docs in a project.
- Add a skill validator and CI.
