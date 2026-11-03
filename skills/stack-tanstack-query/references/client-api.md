# client-api with TanStack Query

The concept skill `client-api` defines the rules. This file holds its TanStack Query detail.

`api/` holds only the raw API model and the HTTP calls. TanStack Query hooks live in the pod's hooks file or folder, and each one wraps a repository call:

```
pods/{pod-name}/
├── hooks.ts                       ← TanStack Query hooks (useQuery / useMutation)
├── {pod-name}.repository.ts       ← Calls the API client, returns ViewModels
├── {pod-name}.mapper.ts           ← API response → ViewModel
└── api/
    ├── index.ts                    ← Barrel: re-exports HTTP calls and types
    ├── {pod-name}.api-model.ts    ← Raw types of the server response
    └── {pod-name}.api.ts          ← HTTP calls
```

## `hooks.ts` — TanStack Query hooks

See skill `client-query` for the full query and mutation pattern.

```ts
// hooks.ts
import { useQuery } from '@tanstack/react-query';
import { productsRepository } from './products.repository';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductListParams) => [...productKeys.lists(), params] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
};

export const useProducts = (params: ProductListParams) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productsRepository.getAll(params),
  });
};
```

## External Documentation

- [TanStack Query — Queries](https://tanstack.com/query/latest/docs/framework/react/guides/queries) — basic `useQuery`
