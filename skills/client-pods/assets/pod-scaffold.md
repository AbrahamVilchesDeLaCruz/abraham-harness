# Pod Scaffold

Use this as the directory structure reference when creating a new pod.

## Minimal Pod (simple feature)

```
pods/{pod-name}/
├── index.ts                          ← public API: re-exports only
├── {PodName}Container.{view}            ← fetching, state, handlers
├── {PodName}Component.{view}            ← pure presentational, no queries
├── {pod-name}.types.ts               ← ViewModel types (ViewModels only)
└── api/
    ├── {pod-name}.api-model.ts       ← raw API response types (snake_case)
    ├── {pod-name}.api.ts             ← fetch functions + server-state hooks
    └── {pod-name}.mapper.ts          ← ApiModel → ViewModel
```

## Full Pod (with sub-components and hooks)

```
pods/{pod-name}/
├── index.ts
├── {PodName}Container.{view}
├── {PodName}Component.{view}
├── {pod-name}.types.ts
├── api/
│   ├── {pod-name}.api-model.ts
│   ├── {pod-name}.api.ts
│   └── {pod-name}.mapper.ts
├── components/                        ← sub-components (only for this pod)
│   ├── {PodName}Card.{view}
│   └── {PodName}Form.{view}
├── hooks/                             ← extracted hooks when > 80 lines
│   ├── use{PodName}State.ts
│   └── use{PodName}Handlers.ts
└── __tests__/
    ├── {PodName}Component.test.{view}
    ├── {PodName}Container.test.{view}
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
| API hooks | `{pod-name}.api.ts` | `products.api.ts` |
| Mapper | `{pod-name}.mapper.ts` | `products.mapper.ts` |
| Hook | `use{PodName}{Purpose}.ts` | `useProductsFilters.ts` |

## Checklist

- [ ] `index.ts` exports only what is needed — not the internal Container and Component at once if only the Container is used
- [ ] `{pod-name}.types.ts` contains **only ViewModels** — no raw API types
- [ ] `api/` has the 3 files: api-model, api.ts, mapper
- [ ] Sub-components in `components/` only if this pod needs them — if shared, they go to `components/shared/`
- [ ] Hooks extracted to `hooks/` when the Container exceeds ~80 lines of logic
