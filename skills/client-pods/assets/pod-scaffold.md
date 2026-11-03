# Pod Scaffold

Use this as the directory structure reference when creating a new pod.

## Minimal Pod (simple feature)

```
pods/{pod-name}/
├── index.ts                          ← public API: re-exports only
├── {PodName}Container.{view}            ← consumes the hooks, passes data and callbacks
├── {PodName}Component.{view}            ← renders what it receives, no queries
├── hooks.ts                          ← use{Something} functions, call the repository
├── {pod-name}.repository.ts          ← calls the API client, returns ViewModels through the mapper
├── {pod-name}.types.ts               ← ViewModel types (ViewModels only)
├── {pod-name}.mapper.ts              ← ApiModel → ViewModel
└── api/
    ├── {pod-name}.api-model.ts       ← raw API response types (camelCase)
    └── {pod-name}.api.ts             ← HTTP calls only
```

## Full Pod (with sub-components and hooks)

```
pods/{pod-name}/
├── index.ts
├── {PodName}Container.{view}
├── {PodName}Component.{view}
├── {pod-name}.repository.ts
├── {pod-name}.types.ts
├── {pod-name}.mapper.ts
├── api/
│   ├── {pod-name}.api-model.ts
│   └── {pod-name}.api.ts
├── components/                        ← sub-components (only for this pod)
│   ├── {PodName}Card.{view}
│   └── {PodName}Form.{view}
├── hooks/                             ← extracted hooks when > 80 lines
│   ├── use{PodName}State.ts
│   └── use{PodName}Handlers.ts
└── __tests__/
    ├── {PodName}Component.test.{view}
    ├── {PodName}Container.test.{view}
    ├── {pod-name}.repository.test.ts
    ├── {pod-name}.mapper.test.ts
    └── {PodName}Mother.ts
```

## `index.ts` — public API

```typescript
// Only export what other parts of the app need
export { {PodName}Container } from './{PodName}Container';
export type { {PodName}VM } from './{pod-name}.types';
```

## `{pod-name}.types.ts`

```typescript
// ViewModel — camelCase, domain-friendly types
export type {PodName}VM = {
  id: string;
  // camelCase fields, Date instead of string for dates
  createdAt: Date;
};
```

## Naming rules

| File | Convention | Example |
|---|---|---|
| Container | `{PodName}Container.{view}` | `ProductsContainer.{view}` |
| Component | `{PodName}Component.{view}` | `ProductsComponent.{view}` |
| Types | `{pod-name}.types.ts` | `products.types.ts` |
| API model | `{pod-name}.api-model.ts` | `products.api-model.ts` |
| HTTP calls | `{pod-name}.api.ts` | `products.api.ts` |
| Repository (pod root) | `{pod-name}.repository.ts` | `products.repository.ts` |
| Mapper (pod root) | `{pod-name}.mapper.ts` | `products.mapper.ts` |
| Hook | `use{Something}.ts` | `useProductsFilters.ts` |

## Checklist

- [ ] `index.ts` exports only what is needed — not the internal Container and Component at once if only the Container is used
- [ ] `{pod-name}.types.ts` contains **only ViewModels** — no raw API types
- [ ] `api/` has the 2 files: api-model, api.ts — only the raw model and the HTTP calls, no hooks
- [ ] `{pod-name}.repository.ts` and `{pod-name}.mapper.ts` are at the pod root
- [ ] Hooks call the repository; the Container and the Component never call it directly
- [ ] The Container consumes the hooks and passes data and callbacks to the Component
- [ ] Sub-components in `components/` only if this pod needs them — if shared, they go to `components/shared/`
- [ ] Hooks extracted to a `hooks` file or folder when the Container exceeds ~80 lines of logic
