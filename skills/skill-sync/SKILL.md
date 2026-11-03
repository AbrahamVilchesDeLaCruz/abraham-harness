---
name: skill-sync
description: "Trigger: After creating or modifying a skill, or when AGENTS.md tables are out of sync. Syncs skill metadata to AGENTS.md Auto-invoke and Available Skills tables."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

## Activation Contract

- After creating a new skill
- After modifying a skill's name or description
- When the Available Skills or Auto-invoke table in `AGENTS.md` is out of sync

## Hard Rules

- The tables between the `abraham-harness` markers in `AGENTS.md` belong to the harness. `update` replaces them, so never edit them.
- A project's own skill goes in the `## Project Skills` table of that project's `AGENTS.md`, and only there. If it has an automatic trigger, add a row to that table's project section, outside the markers.
- A project's own skills live in `skills/{name}/` in the project, and that folder is their source of truth. Install them with `npx skills@latest add ./skills/{name} -a claude-code -a codex -a opencode -y`.
- Directories created by `npx skills add` (`.agents/skills/`, `.claude/skills/`) are **generated**: never edit them.
- A skill in `skills/` that is missing from `AGENTS.md` is invisible to the AI.
- In the `abraham-harness` repository itself, add a shared skill to the matching `AGENTS.*.template.md`, inside the markers.

## Execution Steps

1. Find the project's own skills:

```bash
find skills -name "SKILL.md" 2>/dev/null | sort
```

2. Check the `## Project Skills` table in the root `AGENTS.md`. Each project skill must have a row:

```markdown
| `skill-name` | Short description |
```

3. Add a row with its trigger for any automatic trigger:

```markdown
| Action description | `skill-name` |
```

4. Check scope `AGENTS.md` files. `apps/api/AGENTS.md` and `apps/client/AGENTS.md` should list only the project skills relevant to them.

## Output Contract

Every project skill has a row in the `## Project Skills` table of each `AGENTS.md` it applies to, and no row was edited between the `abraham-harness` markers.

## References

- Read [`references/docs.md`](references/docs.md) for related skills, ADRs and external documentation.
