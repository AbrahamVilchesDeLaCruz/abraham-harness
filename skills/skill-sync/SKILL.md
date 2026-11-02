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

- `skills/` is the **source of truth** — never edit symlinked copies
- Directories created by `npx skills add` (`.agents/skills/`, `.claude/skills/`) are **generated**: never edit them.
- A skill added to `skills/` but missing from `AGENTS.md` is invisible to the AI

## Execution Steps

1. Verify skills on disk:

```bash
find skills .agents/skills .claude/skills -name "SKILL.md" 2>/dev/null | sort
```

2. Check Available Skills table in root AGENTS.md. Each skill must have a row:

```markdown
| `skill-name` | Short description |
```

3. Check Auto-invoke table. Each automatic trigger must have a row:

```markdown
| Action description | `skill-name` |
```

4. Check scope AGENTS.md files. `apps/api/AGENTS.md` and `apps/client/AGENTS.md` should list only skills relevant to their scope.

## Output Contract

Two tables need to stay in sync in **every `AGENTS.md`** that references the skill:

1. **Available Skills** — one row per skill with name, description, link
2. **Auto-invoke** — one row per trigger action → skill mapping

## References

- Read [`references/docs.md`](references/docs.md) for related skills, ADRs and external documentation.
