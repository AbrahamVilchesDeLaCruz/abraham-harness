---
name: client-pods
description: "Trigger: When creating a new pod, defining the directory structure of a feature, or deciding what goes inside a pod. Pod structure, naming, when to create what in apps/client/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

Use this skill when creating a new pod, defining the directory structure of a feature, or deciding what goes inside a pod.

Pod structure for `apps/client/`. A pod is a self-contained functional unit that encapsulates all the logic, UI and data access of a domain feature.

## Hard Rules

- A pod **does NOT import from another pod** directly
- Communication between pods only through `core/`, `common/`, or `common-app/`
- A pod's entry point is always its `index.ts` (which exports the Container)

`.{view}` is the view layer's file extension.

## Decision Gates

If a pod is simple, there is no need to create every folder. The structure grows with complexity:

| Complexity | What to create |
|---|---|
| Minimal pod | `Container.{view}`, `Component.{view}`, `index.ts` |
| With data fetching | + `api/` |
| With complex UI state | + `hooks.ts` or `hooks/` |
| With sub-components | + `components/` |
| With data transformation | + `{pod-name}.mapper.ts` at the pod root, `types.ts` |

## Execution Steps

1. Use the scaffold in `assets/pod-scaffold.md` when creating a new pod (directory structure + naming).
2. Create only what the Decision Gates table asks for.
3. Name each file with the Naming conventions table.

## Output Contract

Global structure:

```
apps/client/src/
├── common/        ← Reusable components with no domain (Button, Input, Modal)
├── common-app/    ← Reusable but tied to the domain (CreateProductPopup)
├── core/          ← Router, auth, API client, interceptors, global providers
├── layout/        ← Visual templates (Sidebar, Topbar, AppShell)
├── pods/          ← Pods organized by domain
└── views/         ← Pages that select a layout + render pods
```

Internal structure of a Pod:

```
pods/
└── {pod-name}/
    ├── api/                          ← Data access layer
    │   ├── index.ts                  ← Barrel
    │   ├── {pod-name}.api-model.ts  ← Raw API types
    │   └── {pod-name}.api.ts        ← Server-state hooks
    ├── hooks/                        ← Pod UI hooks
    │   ├── use{Something}.ts
    │   └── index.ts                  ← Barrel
    ├── components/                   ← Presentational sub-components
    │   └── {PodName}{Part}.{view}
    ├── {PodName}Container.{view}        ← Data binding + routing + context
    ├── {PodName}Component.{view}        ← UI state + composition
    ├── {pod-name}.mapper.ts          ← API response → ViewModel
    ├── {pod-name}.types.ts           ← ViewModel types
    ├── {pod-name}.styles.ts          ← Pod styles (if applicable)
    └── index.ts                      ← Barrel: exports the Container
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
| API hooks | `{pod-name}.api.ts` | `products.api.ts` |
| Mapper | `{pod-name}.mapper.ts` | `products.mapper.ts` |
| ViewModel types | `{pod-name}.types.ts` | `products.types.ts` |
| Styles | `{pod-name}.styles.ts` | `products.styles.ts` |
| Barrels | `index.ts` | `hooks/index.ts`, `api/index.ts` |

## References

- [`references/patterns.md`](references/patterns.md) — example of a minimal pod.
- [`assets/pod-scaffold.md`](assets/pod-scaffold.md) — scaffold for creating a new pod.
- [`references/docs.md`](references/docs.md) — Read `references/docs.md` for related skills and the architectural decision.
- Full reference: `docs/engineering/frontend-architecture.md`
- Load the project's stack skill for views (`stack-react`) and read its `references/client-pods.md`.
- Load the project's stack skill for server state (`stack-tanstack-query`) and read its `references/client-pods.md`.
