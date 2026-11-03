# skill-sync — Docs & References

## Related Skills

| Skill | Why read it |
|---|---|
| `skill-creator` | How to create a new skill: after creating it, run `skill-sync` |

## What to sync

After creating or modifying a project's own skill, update the `## Project Skills` table in `AGENTS.md`:

```markdown
| Skill | Trigger | Description |
| `skill-name` | Action that invokes it | Short description |
```

The Auto-invoke Skills and Available Skills tables sit between `abraham-harness` markers, and `update` replaces them. In the `abraham-harness` repository, shared skills are added to these tables in `AGENTS.*.template.md`.

## Scopes

| Scope | When to use |
|---|---|
| `global` | Skill applies to the whole monorepo (git-workflow, tdd-workflow) |
| `api` | Skill applies only to `apps/api/` |
| `client` | Skill applies only to `apps/client/` |

## Internal Docs

| Doc | Relevant content |
|---|---|
| `AGENTS.md` | The table to sync: Project Skills |
