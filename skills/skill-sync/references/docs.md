# skill-sync — Docs & References

## Related Skills

| Skill | Why read it |
|---|---|
| `skill-creator` | How to create a new skill: after creating it, run `skill-sync` |

## What to sync

After creating or modifying any skill, update these two tables in `AGENTS.md`:

1. **Auto-invoke Skills** (top of `AGENTS.md`):
   ```markdown
   | Action | Skill |
   | Before implementing any new feature... | `tdd-workflow` |
   ```

2. **Available Skills** table:
   ```markdown
   | Skill | Scope | Description | URL |
   | `api-domain` | api | AggregateRoot, Value Objects... |
   ```

## Scopes

| Scope | When to use |
|---|---|
| `global` | Skill applies to the whole monorepo (git-workflow, tdd-workflow) |
| `api` | Skill applies only to `apps/api/` |
| `client` | Skill applies only to `apps/client/` |

## Internal Docs

| Doc | Relevant content |
|---|---|
| `AGENTS.md` | The tables to sync: Auto-invoke Skills and Available Skills |
