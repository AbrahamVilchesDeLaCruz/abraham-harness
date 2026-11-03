---
name: client-pods
description: "Trigger: When creating a new pod, defining the directory structure of a feature, or deciding what goes inside a pod. Pod structure, data flow, naming, when to create what in apps/client/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

Use this skill when creating a pod, defining a feature's directory structure, or deciding what goes inside a pod.

A pod in `apps/client/` is a self-contained unit that encapsulates all the logic, UI and data access of a domain feature.

**Data flow:** Container -> hooks -> repository -> API client -> HTTP request, and then render in the Component.

## Hard Rules

- A pod **does NOT import from another pod** directly
- Communication between pods only through `core/`, `common/`, or `common-app/`
- A pod's entry point is always its `index.ts` (which exports the Container)

`.{view}` is the view layer's file extension.

## Decision Gates

The structure grows with complexity; a simple pod does not create every folder:

| Complexity | What to create |
|---|---|
| Minimal pod | `Container.{view}`, `Component.{view}`, `index.ts` |
| With data fetching | + `api/`, hooks, and at the pod root `{pod-name}.repository.ts`, `{pod-name}.mapper.ts`, `types.ts` |
| With complex UI state | + `hooks.ts` or `hooks/` |
| With sub-components | + `components/` |

## Execution Steps

1. Use the scaffold in `assets/pod-scaffold.md` for a new pod (directories + naming).
2. Create only what the Decision Gates table asks for.
3. Name each file with the Naming conventions table.

## Output Contract

Global structure:

```
apps/client/src/
├── common/     ← Reusable, no domain (Button, Input, Modal)
├── common-app/ ← Reusable, tied to the domain (CreateProductPopup)
├── core/       ← Router, auth, API client, interceptors, global providers
├── layout/     ← Visual templates (Sidebar, Topbar, AppShell)
├── pods/       ← Pods organized by domain
└── views/      ← Pages that select a layout + render pods
```

Internal structure of a Pod:

```
pods/
└── {pod-name}/
    ├── api/                       ← Raw API model and HTTP calls only
    │   ├── index.ts               ← Barrel
    │   ├── {pod-name}.api-model.ts ← Raw API types
    │   └── {pod-name}.api.ts      ← HTTP calls
    ├── hooks/                     ← Pod hooks, consumed by the Container
    │   ├── use{Something}.ts
    │   └── index.ts               ← Barrel
    ├── components/                ← Presentational sub-components
    │   └── {PodName}{Part}.{view}
    ├── {PodName}Container.{view}  ← Consumes hooks, passes data, callbacks
    ├── {PodName}Component.{view}  ← Renders what it receives
    ├── {pod-name}.repository.ts   ← Calls API client, returns ViewModels
    ├── {pod-name}.mapper.ts       ← API response → ViewModel
    ├── {pod-name}.types.ts        ← ViewModel types
    ├── {pod-name}.styles.ts       ← Pod styles (if applicable)
    └── index.ts                   ← Barrel: exports the Container
```

Naming conventions:

| Element | Convention | Example |
|---|---|---|
| Container | `PascalCase + Container.{view}` | `ProductsContainer.{view}` |
| Component | `PascalCase + Component.{view}` | `ProductsComponent.{view}` |
| Sub-components | `PascalCase.{view}` | `ProductGrid.{view}` |
| Pod hooks | `camelCase.ts` | `useProductFilters.ts` |
| Global hooks | `camelCase.ts` | `useClickOutside.ts` |
| API model | `{pod-name}.api-model.ts` | `products.api-model.ts` |
| HTTP calls | `{pod-name}.api.ts` | `products.api.ts` |
| Repository | `{pod-name}.repository.ts` | `products.repository.ts` |
| Mapper | `{pod-name}.mapper.ts` | `products.mapper.ts` |
| ViewModel types | `{pod-name}.types.ts` | `products.types.ts` |
| Styles | `{pod-name}.styles.ts` | `products.styles.ts` |
| Barrels | `index.ts` | `hooks/index.ts` |

## References

- [`references/patterns.md`](references/patterns.md) — example pod.
- [`assets/pod-scaffold.md`](assets/pod-scaffold.md) — new pod scaffold.
- [`references/docs.md`](references/docs.md) — related skills and the architectural decision.
- Full reference: `docs/engineering/frontend-architecture.md`
- Load the project's stack skills for views (`stack-react`) and server state (`stack-tanstack-query`), and read `references/client-pods.md` in each.
