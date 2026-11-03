# client-pods with React

The concept skill `client-pods` defines the rules. This file holds its React and build tool detail.

## Pod trees with `.tsx`

Internal structure of a pod:

```
pods/
└── {pod-name}/
    ├── api/                          ← Raw API model and HTTP calls only
    │   ├── index.ts                  ← Barrel
    │   ├── {pod-name}.api-model.ts  ← Raw API types
    │   └── {pod-name}.api.ts        ← HTTP calls
    ├── hooks/                        ← Pod hooks, consumed by the Container
    │   ├── use{Something}.ts
    │   └── index.ts                  ← Barrel
    ├── components/                   ← Presentational sub-components
    │   └── {PodName}{Part}.tsx
    ├── {PodName}Container.tsx        ← Consumes hooks, passes data and callbacks
    ├── {PodName}Component.tsx        ← Renders what it receives
    ├── {pod-name}.repository.ts      ← Calls the API client, returns ViewModels
    ├── {pod-name}.mapper.ts          ← API response → ViewModel
    ├── {pod-name}.types.ts           ← ViewModel types
    ├── {pod-name}.styles.ts          ← Pod styles (if applicable)
    └── index.ts                      ← Barrel: exports the Container
```

Minimal pod files: `Container.tsx`, `Component.tsx`, `index.ts`.

Minimal pod scaffold:

```
pods/{pod-name}/
├── index.ts                          ← public API: re-exports only
├── {PodName}Container.tsx            ← consumes the hooks, passes data and callbacks
├── {PodName}Component.tsx            ← renders what it receives, no queries
├── hooks.ts                          ← use{Something} functions, call the repository
├── {pod-name}.repository.ts          ← calls the API client, returns ViewModels through the mapper
├── {pod-name}.types.ts               ← ViewModel types (ViewModels only)
├── {pod-name}.mapper.ts              ← ApiModel → ViewModel
└── api/
    ├── {pod-name}.api-model.ts       ← raw API response types (camelCase)
    └── {pod-name}.api.ts             ← HTTP calls only
```

Full pod scaffold, with sub-components and hooks:

```
pods/{pod-name}/
├── index.ts
├── {PodName}Container.tsx
├── {PodName}Component.tsx
├── {pod-name}.repository.ts
├── {pod-name}.types.ts
├── {pod-name}.mapper.ts
├── api/
│   ├── {pod-name}.api-model.ts
│   └── {pod-name}.api.ts
├── components/                        ← sub-components (only for this pod)
│   ├── {PodName}Card.tsx
│   └── {PodName}Form.tsx
├── hooks/                             ← extracted hooks when > 80 lines
│   ├── use{PodName}State.ts
│   └── use{PodName}Handlers.ts
└── __tests__/
    ├── {PodName}Component.test.tsx
    ├── {PodName}Container.test.tsx
    ├── {pod-name}.repository.test.ts
    ├── {pod-name}.mapper.test.ts
    └── {PodName}Mother.ts
```

Example of a minimal pod:

```
pods/
└── profile/
    ├── api/
    │   ├── index.ts
    │   ├── profile.api-model.ts
    │   └── profile.api.ts
    ├── hooks.ts
    ├── ProfileContainer.tsx
    ├── ProfileComponent.tsx
    ├── profile.repository.ts
    ├── profile.mapper.ts
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
