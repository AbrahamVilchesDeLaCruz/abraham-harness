# client-api — Docs & References

## Related Skills

| Skill | Why read it |
|---|---|
| `client-pods` | Pod structure — where the api/ layer lives |
| `client-query` | Server-state hooks that consume the functions in api.ts |
| `client-container-presentational` | Container that uses the queries and passes ViewModels to the Component |
| `client-testing` | How to test mappers (unit) and Containers with HTTP interception (integration) |

## External Documentation

- [Fetch API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) — native alternative

## Pattern: Why separate ApiModel and ViewModel

**ApiModel** captures exactly what the backend returns (snake_case, strings for dates). When the backend changes, only the mapper is updated.

**ViewModel** is what the components consume. It stays stable even if the backend changes its naming or structure. Component tests use ViewModels directly (via Object Mothers), not raw API data.

This pattern allows:
1. Changing the backend without touching the component tests
2. Testing the mapper in isolation (pure function)
3. Reasoning about UI state without knowing the API details

## Internal Docs

| Doc | Relevant content |
|---|---|
| `docs/engineering/frontend-architecture.md` | How the api/ layer fits into the pod architecture |
