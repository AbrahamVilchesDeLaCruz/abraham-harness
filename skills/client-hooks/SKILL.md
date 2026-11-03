---
name: client-hooks
description: "Trigger: When creating state or handler hooks in a pod, extracting logic to global hooks, or deciding when to create a hook. Pod hooks [State, Handlers], global hooks, when to extract in apps/client/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

Use this skill when creating state or handler hooks in a pod, extracting logic to global hooks, or deciding when to create a hook.

Pod hooks and global hooks in `apps/client/`. A hook here is a named unit of reusable view logic.

## Hard Rules

- A pod hook **is not imported from another pod** — if two pods need it, move it to `core/hooks/`
- Pod hooks may use global hooks
- Pod hooks **do not fetch** — that is the responsibility of `api.ts`
- A global hook **has no domain logic** — if it has any, it is a pod hook
- Pod hooks are named functions in a separate `hooks` file or folder of the pod, called `use{Something}`
- A pod hook that exposes state returns a tuple, to destructure cleanly in the Component: `[State, Handlers]`
- A pod hook that only exposes functions may return named functions
- Naming: file `camelCase.ts` → `useProductFilters.ts`; export `camelCase` → `useProductFilters`
- Mandatory barrel for a `hooks/` folder: `hooks/index.ts` re-exports everything

## Decision Gates

| Type | Location | Scope |
|---|---|---|
| Pod hooks | `pods/{pod-name}/hooks.ts` or `pods/{pod-name}/hooks/` | Only inside the pod |
| Global hooks | `core/hooks/` or `common/hooks/` | Reusable across pods |

Create a pod hook:

- When there is a cohesive group of local state + handlers (filters, tooltips, pagination, selection)
- When the Component has more than ~5 local state values → a sign that there are hooks to extract
- When the logic can be named with a clear noun: `filters`, `tooltip`, `pagination`

## Execution Steps

1. Decide type and location with the Decision Gates table.
2. Use the template in `assets/use-state-handlers.template.md` when extracting `use{Pod}State` and `use{Pod}Handlers`.
3. Follow the shape in `references/patterns.md`: tuple, usage in the Component, barrel and example global hooks.
4. Add the pod hook to the `hooks/index.ts` barrel.

## Output Contract

A pod hook that returns the `[State, Handlers]` tuple when it exposes state and is re-exported in `hooks/index.ts`, or a global hook with no domain logic in its global location.

## References

- [`references/patterns.md`](references/patterns.md) — return pattern, usage in the Component, pod barrel and global hooks.
- [`assets/use-state-handlers.template.md`](assets/use-state-handlers.template.md) — template for extracting `use{Pod}State` and `use{Pod}Handlers`.
- [`references/docs.md`](references/docs.md) — Read `references/docs.md` for the tuple pattern rationale and external docs.
- Load the project's stack skill for views (`stack-react`) and read its `references/client-hooks.md`.
- Load the project's stack skill for server state (`stack-tanstack-query`) and read its `references/client-hooks.md`.
- Load the project's stack skill for tests (`stack-vitest`) and read its `references/client-hooks.md`.
