# client-hooks — Docs & References

## Related Skills

| Skill | Why read it |
|---|---|
| `client-container-presentational` | The Container consumes the pod's hooks |
| `client-api` | The repository that the hooks call |
| `client-query` | Server-state hooks that wrap a repository call |
| `client-pods` | Pod structure — where the `hooks/` folder lives |
| `client-testing` | How to test hooks |

## Why named fields

Every hook, pod or global, returns an object with named fields, also when it exposes state, instead of a tuple. The advantages:

1. **Read what you need**: `const { size, setSize } = useProductFilters()` — the Container names the fields it uses, in any order
2. **Rename on conflict**: `const { reset: resetFilters } = useProductFilters()` — no name conflicts when the Container uses several hooks

## Internal Docs

| Doc | Relevant content |
|---|---|
| `frontend-architecture.md` in `engineering-conventions` | When to extract hooks in the context of the project architecture |
| `engineering-principles.md` in `engineering-conventions` | SRP in the frontend — one hook = one responsibility |
