---
name: client-container-presentational
description: "Trigger: When creating or changing Containers and Components in pods, defining the props contract, or separating logic from UI. Container/Component contract, responsibilities, prohibitions in apps/client/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

Use this skill when creating or changing Containers and Components in pods, defining the props contract, or separating logic from UI in `apps/client/`.

The central pattern of the client. Each pod has two mandatory pieces: **Container** and **Component**.

## Hard Rules

### Container (`*Container.{view}`)

The pod's **gateway to the outside world**.

Exclusive responsibilities:

- Data binding: server-state queries and mutations
- Routing: route params, location, navigation, search params
- Global context: client state store, global context
- Callbacks that trigger mutations or navigation
- Memoization to derive query params (never local state for derived values)

Prohibitions:

- ❌ UI local state (modals, tooltips, visual filters)
- ❌ Complex markup — renders only `<{Feature}Component />` with props
- ❌ Effects, except a trivial sync outward
- ❌ Data transformations (that is the mapper's job)

### Component (`*Component.{view}`)

The **owner of the UI**: visual state, lifecycle, composition.

Responsibilities:

- UI state: local state for modals, tooltips, filters, toggles
- Effects to sync local UI state
- Refs for third-party components, scroll, focus
- Composition: renders sub-components from `components/`
- Consumes the pod's hooks (`hooks/`) to encapsulate complex UI logic

Prohibitions:

- ❌ Server-state queries and mutations — it does not fetch data
- ❌ Route params, navigation, location — it does not access routing
- ❌ Client state store or global context
- ❌ Business logic — only presentation and UI state

### Props contract

- Always declare an explicit interface for the Component's props.
- The Component never knows how an action runs — it only receives callbacks.

## Decision Gates

| File | Approx. lines | If it exceeds them |
|---|---|---|
| Container | ~40–80 lines | If the Container exceeds 80 lines, it probably has UI logic that does not belong to it. |
| Component | ~80–150 lines | If the Component exceeds 150 lines, there are probably pod hooks to extract. |

## Execution Steps

1. Use the template in `assets/container.template.md` when creating a new Container + Component.
2. Distribute each piece according to the Hard Rules; the shape of each file, the visual contract and the callback flow are in `references/patterns.md`.
3. Check the size of each file with the Decision Gates table.

## Output Contract

A `*Container.{view}` that renders only `<{Feature}Component />` with props and a `*Component.{view}` with its explicit props interface, both within the limits of the Hard Rules.

## References

- [`references/patterns.md`](references/patterns.md) — examples of Container and Component, Props interface, visual contract and callback flow.
- [`assets/container.template.md`](assets/container.template.md) — template for creating a new Container + Component.
- [`references/docs.md`](references/docs.md) — Read `references/docs.md` for the pattern rationale and external docs.
- Full reference: `docs/engineering/frontend-architecture.md`
- Load the project's stack skill for views (`stack-react`) and read its `references/client-container-presentational.md`.
- Load the project's stack skill for server state (`stack-tanstack-query`) and read its `references/client-container-presentational.md`.
- Load the project's stack skill for tests (`stack-vitest`) and read its `references/client-container-presentational.md`.
