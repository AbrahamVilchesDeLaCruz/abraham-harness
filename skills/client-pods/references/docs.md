# client-pods — Docs & References

## Related Skills

| Skill | Why read it |
|---|---|
| `client-container-presentational` | Container/Component contract — responsibilities and prohibitions |
| `client-api` | api/ layer: api-model, api.ts; pod-root mapper |
| `client-query` | Server-state hooks inside api.ts |
| `client-hooks` | When and how to extract hooks from the Container |
| `client-testing` | How to test the Component and the Container |

## Decision: Why pods instead of feature folders

Pods place everything related to a feature in a single directory, including the data layer (api/). This reduces the number of files to search when working on a feature and makes it more obvious what can be deleted when a feature disappears.

The alternative (separating by type: `components/`, `hooks/`, `services/`) scatters related code and makes it harder to reason about what belongs to which feature.

## Internal Docs

| Doc | Relevant content |
|---|---|
| `docs/engineering/frontend-architecture.md` | Full pod architecture: structure, naming, rules — **mandatory reading before creating a pod** |
