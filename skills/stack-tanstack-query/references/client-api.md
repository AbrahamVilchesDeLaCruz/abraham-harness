# client-api with TanStack Query

The concept skill `client-api` defines the rules. This file holds its TanStack Query detail.

The server-state hooks of the `api/` layer are TanStack Query hooks:

```
containers/{feature}/
└── api/
    ├── index.ts                    ← Barrel: re-exports hooks and types
    ├── {feature}.api-model.ts     ← Raw types of the server response
    └── {feature}.api.ts           ← TanStack Query hooks (useQuery / useMutation)
```

## `{feature}.api.ts` — TanStack Query hooks

See skill `client-query` for the full query and mutation pattern.

```ts
// products.api.ts
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductListParams) => [...productKeys.lists(), params] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
};

export const useProducts = (params: ProductListParams) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => apiClient.get<ProductApiModel[]>('/products', { params }),
    select: (data) => data.map(mapProduct),
  });
};
```

## External Documentation

- [TanStack Query — Queries](https://tanstack.com/query/latest/docs/framework/react/guides/queries) — basic `useQuery`
