# client-hooks — Docs & References

## Related Skills

| Skill | Why read it |
|---|---|
| `client-container-presentational` | The Container is where the logic lives before it is extracted |
| `client-query` | Server-state hooks used in handlers |
| `client-pods` | Pod structure — where the `hooks/` folder lives |
| `client-testing` | How to test hooks |

## State tuple vs. object return

This project uses the `[state, handlers]` tuple pattern (inspired by the local state primitive of the view library) instead of a plain `{ state, handlers }` object. The advantages:

1. **Destructuring with rename**: `const [productState, productHandlers] = useProductState()` — no name conflicts when the Container uses several state hooks
2. **Clear convention**: `state` = read-only, `handlers` = write-only — the tuple enforces the contract visually

## Internal Docs

| Doc | Relevant content |
|---|---|
| `docs/engineering/frontend-architecture.md` | When to extract hooks in the context of the project architecture |
| `docs/engineering/engineering-principles.md` | SRP in the frontend — one hook = one responsibility |
