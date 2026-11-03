# client-hooks — Docs & References

## Related Skills

| Skill | Why read it |
|---|---|
| `client-container-presentational` | The Container is where the logic lives before it is extracted |
| `client-query` | Server-state hooks used in handlers |
| `client-pods` | Pod structure — where the `hooks/` folder lives |
| `client-testing` | How to test hooks |

## Why named fields

Every hook, pod or global, returns an object with named fields, also when it exposes state, instead of a tuple. The advantages:

1. **Read what you need**: `const { size, setSize } = useProductFilters()` — the Component names the fields it uses, in any order
2. **Rename on conflict**: `const { reset: resetFilters } = useProductFilters()` — no name conflicts when the Component uses several hooks

## Internal Docs

| Doc | Relevant content |
|---|---|
| `docs/engineering/frontend-architecture.md` | When to extract hooks in the context of the project architecture |
| `docs/engineering/engineering-principles.md` | SRP in the frontend — one hook = one responsibility |
