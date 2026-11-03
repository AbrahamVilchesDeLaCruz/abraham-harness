# client-query — Docs & References

## Related Skills

| Skill | Why read it |
|---|---|
| `client-api` | api/ layer: api-model; pod-root mapper — what the hooks consume |
| `client-container-presentational` | How the Container uses the hooks |
| `client-hooks` | When to extract logic from the Container's hooks |
| `client-testing` | How to test Containers with queries using HTTP interception |

## Query Key Strategy

The query key strategy of this project uses hierarchical arrays:

```
['{resource}']                    ← all resources
['{resource}', 'list']            ← all lists
['{resource}', 'list', filters]   ← list with specific filters
['{resource}', 'detail']          ← all details
['{resource}', 'detail', id]      ← specific detail
```

This allows invalidating at different levels of granularity:
- Invalidating `productKeys.all` → invalidates everything
- Invalidating `productKeys.lists()` → lists only
- Invalidating `productKeys.detail(id)` → that id only

## Internal Docs

| Doc | Relevant content |
|---|---|
| `docs/engineering/frontend-architecture.md` | How server state fits into the project's pod architecture |
