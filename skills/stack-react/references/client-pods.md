# client-pods with React

The concept skill `client-pods` defines the rules. This file holds its React and build tool detail.

## Pod trees with `.tsx`

Internal structure of a pod:

```
containers/
└── {feature}/
    ├── api/                          ← Data access layer
    │   ├── index.ts                  ← Barrel
    │   ├── {feature}.api-model.ts   ← Raw API types
    │   └── {feature}.api.ts         ← TanStack Query hooks
    ├── hooks/                        ← Pod UI hooks
    │   ├── use{Feature}{Concern}.ts
    │   └── index.ts                  ← Barrel
    ├── components/                   ← Presentational sub-components
    │   └── {Feature}{Part}.tsx
    ├── {Feature}Container.tsx        ← Data binding + routing + context
    ├── {Feature}Component.tsx        ← UI state + composition
    ├── {feature}.mapper.ts           ← API response → ViewModel
    ├── {feature}.types.ts            ← ViewModel types
    ├── {feature}.styles.ts           ← Pod styles (if applicable)
    └── index.ts                      ← Barrel: exports the Container
```

Minimal pod files: `Container.tsx`, `Component.tsx`, `index.ts`.

Minimal pod scaffold:

```
pods/{pod-name}/
├── index.ts                          ← public API: re-exports only
├── {PodName}Container.tsx            ← fetching, state, handlers
├── {PodName}Component.tsx            ← pure presentational, no queries
├── {pod-name}.types.ts               ← ViewModel types (ViewModels only)
└── api/
    ├── {pod-name}.api-model.ts       ← raw API response types (snake_case)
    ├── {pod-name}.api.ts             ← fetch functions + TanStack Query hooks
    └── {pod-name}.mapper.ts          ← ApiModel → ViewModel
```

Full pod scaffold, with sub-components and hooks:

```
pods/{pod-name}/
├── index.ts
├── {PodName}Container.tsx
├── {PodName}Component.tsx
├── {pod-name}.types.ts
├── api/
│   ├── {pod-name}.api-model.ts
│   ├── {pod-name}.api.ts
│   └── {pod-name}.mapper.ts
├── components/                        ← sub-components (only for this pod)
│   ├── {PodName}Card.tsx
│   └── {PodName}Form.tsx
├── hooks/                             ← extracted hooks when > 80 lines
│   ├── use{PodName}State.ts
│   └── use{PodName}Handlers.ts
└── __tests__/
    ├── {PodName}Component.test.tsx
    ├── {PodName}Container.test.tsx
    ├── {pod-name}.mapper.test.ts
    └── {PodName}Mother.ts
```

Example of a minimal pod:

```
containers/
└── profile/
    ├── api/
    │   ├── index.ts
    │   ├── profile.api-model.ts
    │   └── profile.api.ts
    ├── ProfileContainer.tsx
    ├── ProfileComponent.tsx
    ├── profile.types.ts
    └── index.ts
```

Naming of the view files:

| Element | Convention | Example |
|---|---|---|
| Container | `PascalCase + Container.tsx` | `ProductsContainer.tsx` |
| Component | `PascalCase + Component.tsx` | `ProductsComponent.tsx` |
| Sub-components | `PascalCase.tsx` | `ProductGrid.tsx` |

## External Documentation

- [React — File Structure](https://react.dev/learn/thinking-in-react) — official React guidance on how to organize components
- [Vite — Path Aliases](https://vitejs.dev/config/resolve-resolve-alias) — configuring the `@/` alias

In the concept skill, `.{view}` means `.tsx` in this stack.
