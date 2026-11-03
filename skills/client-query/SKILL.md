---
name: client-query
description: "Trigger: When running server-state queries or mutations, defining query keys, or invalidating queries after a mutation. Server state: queries, mutations, query keys, invalidation in apps/client/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

Use this skill when running server-state queries or mutations, defining query keys, or invalidating queries after a mutation.

How to handle server state in `apps/client/`. Queries and mutations are named `use{Something}` functions in the pod's hooks file or folder, and each one wraps a repository call.

## Hard Rules

- **Queries** → hooks in the pod's hooks file, consumed by the Container (data fetching)
- **Mutations** → hooks in the pod's hooks file, consumed by the Container (side effects)
- A query or mutation hook calls `{pod-name}.repository.ts`, never the API client or HTTP directly. The repository already returns ViewModels
- The Component **never** calls queries or mutations directly
- Query keys are arrays. They must be **consistent** within the pod. Pattern: `[domain, resource, params]`
- Export the keys as constants to reuse them in invalidations
- Use the server-state library's own states directly — do not duplicate them in local state
- Configure the default freshness window in the global server-state client (`core/`)

## Decision Gates

Invalidation:

| When | What to invalidate |
|---|---|
| Creating an item | Invalidate `keys.lists()` |
| Deleting an item | Invalidate `keys.lists()` + remove the cache entry at `keys.detail(id)` |
| Updating an item | Write `updated` to the cache at `keys.detail(id)` + invalidate `keys.lists()` |
| Action that affects several resources | Invalidate the key `['products']` — invalidates the whole domain |

Freshness window: override per query only when necessary:

| Data | Value |
|---|---|
| Very dynamic data | `0` |
| Static data | `Infinity` |

## Execution Steps

1. Use the template in `assets/query-hook.template.md` when creating queries, mutations and query keys for a new pod.
2. Define keys, queries and mutations in the pod's hooks file following `references/patterns.md`.
3. Consume them from the Container and pass data and callbacks to the Component.
4. Choose the invalidation of each mutation with the Decision Gates table.

## Output Contract

Query and mutation hooks in the pod's hooks file, with exported keys and invalidation according to the table, each wrapping a repository call, consumed only from the Container.

## References

- [`references/patterns.md`](references/patterns.md) — query keys, queries, mutations, usage in the Container, UI states and the default freshness window.
- [`assets/query-hook.template.md`](assets/query-hook.template.md) — template for creating queries, mutations and query keys for a new pod.
- [`references/docs.md`](references/docs.md) — Read `references/docs.md` for the project's query key strategy.
- Load the project's stack skill for server state (`stack-tanstack-query`) and read its `references/client-query.md`.
