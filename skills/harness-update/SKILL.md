---
name: harness-update
description: "Trigger: When refreshing an existing project's abraham-harness installation. Updates shared skills, generated agents, managed AGENTS.md tables and Makefile modules, then verifies the result."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

Use this skill from an existing project's root when the user asks to update its abraham-harness installation. Project scope is the default; use global scope only when explicitly requested. A new project uses `project-bootstrap` instead.

## Hard Rules

- Follow the target project's `AGENTS.md` and Git policy. Preserve project-owned `docs/`, `skills/`, stack choices, uncommitted work and custom files. Do not commit, push or publish unless authorized.
- Use the harness `update` command for an existing installation. Do not rerun `install` or a wildcard `skills add`: those reinstall existing skill directories and can overwrite local edits.
- Installed shared skill directories are generated. Before updating, inspect the target's status for hand edits there; preserve or move them to project-owned skills first. Do not claim that an updater preserved edits you have not checked.
- Treat a `check` exit of 1 with an update report as "updates available"; distinguish it from a command or network failure. Stop on an unresolved failure instead of reporting success.
- Keep generated role files and managed `AGENTS.md` blocks current, but never replace a hand-written role or an entire project `AGENTS.md` to force an update.

## Decision Gates

| Situation | Action |
| --- | --- |
| Existing project installation | Run `check` and `doctor` for the selected release, then `update`; inspect projects with local overrides separately |
| No installed harness skills | Use `project-bootstrap` to align the project; do not treat it as an in-place update |
| An `AGENTS.md` lacks harness markers | Migrate old shared skill tables into the managed blocks; preserve project-owned rows and rules outside them, then rerun `update` |
| A Makefile module is reported as hand edited | Move custom targets to `make/project.mk` with `makefile` guidance before replacing the managed module; report ambiguity |
| A generated role is missing in an installed runtime | `update` adds it; confirm hand-written roles remain untouched |

## Execution Steps

1. Confirm the project root, requested scope, Git status, installed harness directories and `skills-lock.json`. Inspect modified generated files before any command that could replace them. Record the starting state.
2. Select the requested published release. Run `npx github:AbrahamVilchesDeLaCruz/abraham-harness#<tag> check`, then use the same tag for `update`. The latter also refreshes managed files that `check` does not inspect. Add `--global` only for an explicitly global request.
3. Read the updater's skipped-file reports. For legacy `AGENTS.md`, identify old shared Auto-invoke and Available Skills rows, migrate them into the managed blocks from the installed `project-bootstrap` templates, and keep project-specific rows and rules outside those blocks. Do not leave duplicate stale tables or scaffold apps. For edited Makefile modules, preserve custom targets in `make/project.mk` before replacing the managed file. If a safe reconciliation is unclear, leave that file unchanged and report the exact blocker.
4. Rerun `check` and `doctor --json`; inspect `git diff --check`, changed paths, `skills-lock.json`, generated roles for Claude Code, Codex and OpenCode, managed `AGENTS.md` tables and Makefile modules that exist. Run focused project checks if the update changed executable configuration. Report remaining skipped files and checks not run.

## Output Contract

Return the scope, before/after update status, installed or refreshed skills and roles, changed managed files, preserved project-owned files, commands and observed results, and any remaining manual migration. Give the user the changed paths to commit; do not claim a remote publication occurred without observing it.

## References

- The installed `project-bootstrap`, `makefile` and `skill-sync` skills own alignment, managed Makefile modules and project-only skill tables respectively. Load one only for a reconciliation it actually governs.
