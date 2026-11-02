# client-query with TanStack Query

The concept skill `client-query` defines the rules. This file holds its TanStack Query detail: how to use TanStack Query in `apps/client/`.

## Rules mapped to TanStack Query

- **`useQuery`** → in the Container (data fetching)
- **`useMutation`** → in the Container (side effects)
- Use the TanStack Query states directly — do not duplicate them in `useState`
- Configure the default `staleTime` in the global `QueryClient` (`core/`)

## Invalidation

| When | What to invalidate |
|---|---|
| Creating an item | `invalidateQueries(keys.lists())` |
| Deleting an item | `invalidateQueries(keys.lists())` + `removeQueries(keys.detail(id))` |
| Updating an item | `setQueryData(keys.detail(id), updated)` + `invalidateQueries(keys.lists())` |
| Action that affects several resources | `invalidateQueries({ queryKey: ['products'] })` — invalidates the whole domain |

`staleTime`: override per query only when necessary:

| Data | Value |
|---|---|
| Very dynamic data | `staleTime: 0` |
| Static data | `staleTime: Infinity` |

## useQuery — data fetching

```ts
// products.api.ts
export const useProducts = (params: ProductListParams) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => apiClient.get<ProductApiModel[]>('/products', { params }),
    select: (data) => data.map(mapProduct),  // mapper here if simple
    staleTime: 1000 * 60 * 5,                  // 5 min — adjust as needed
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => apiClient.get<ProductApiModel>(`/products/${id}`),
    select: mapProduct,
    enabled: !!id,  // do not run without an id
  });
};
```

## useMutation — side effects

```ts
// products.api.ts
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductPayload) =>
      apiClient.post<ProductApiModel>('/products', data),
    onSuccess: () => {
      // Invalidates every list — the Container does not need to know how
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/products/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.removeQueries({ queryKey: productKeys.detail(id) });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductPayload }) =>
      apiClient.patch<ProductApiModel>(`/products/${id}`, data),
    onSuccess: (updated) => {
      // Updates the cache directly — avoids an unnecessary refetch
      queryClient.setQueryData(productKeys.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};
```

## Usage in the Container

```tsx
// ProductsContainer.tsx
export const ProductsContainer = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [page, setPage] = useState(1);

  const { data: products = [], isLoading, isError } = useProducts({ categoryId, page });
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  return (
    <ProductsComponent
      products={products}
      isLoading={isLoading}
      isError={isError}
      isDeleting={isDeleting}
      onDelete={(id) => deleteProduct(id)}
      onPageChange={setPage}
    />
  );
};
```

## UI states of the query

Use the TanStack Query states directly — do not duplicate them in `useState`:

```tsx
// ✅ correct
const { data, isLoading, isError, isFetching } = useProducts(params);

// ❌ incorrect — duplicating state
const [loading, setLoading] = useState(false);
```

## Default staleTime

Configure it in the global `QueryClient` (`core/`):

```ts
// core/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,  // 2 min by default
      retry: 1,
    },
  },
});
```

Override per query only when necessary (very dynamic data → `staleTime: 0`, static data → `staleTime: Infinity`).

## Invalidation granularity

- `invalidateQueries({ queryKey: productKeys.all })` → invalidates everything
- `invalidateQueries({ queryKey: productKeys.lists() })` → lists only
- `invalidateQueries({ queryKey: productKeys.detail(id) })` → that id only

## useQuery hook template

```typescript
import { useQuery } from '@tanstack/react-query';
import { {podName}Keys } from './{pod-name}.query-keys';
import { get{PodName}s } from './{pod-name}.api-client';
import { map{PodName} } from './{pod-name}.mapper';

export function use{PodName}s(filters?: {PodName}Filters) {
  return useQuery({
    queryKey: {podName}Keys.list(filters),
    queryFn: async () => {
      const raw = await get{PodName}s(filters);
      return raw.map(map{PodName});
    },
  });
}

export function use{PodName}(id: string) {
  return useQuery({
    queryKey: {podName}Keys.detail(id),
    queryFn: async () => {
      const raw = await get{PodName}(id);
      return map{PodName}(raw);
    },
    enabled: !!id,
  });
}
```

## useMutation hook template (POST / PATCH / DELETE)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { {podName}Keys } from './{pod-name}.query-keys';
import { create{PodName} } from './{pod-name}.api-client';

export function useCreate{PodName}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Create{PodName}Input) => create{PodName}(data),
    onSuccess: () => {
      // Invalidate to trigger refetch of affected queries
      queryClient.invalidateQueries({ queryKey: {podName}Keys.lists() });
    },
    onError: (error) => {
      // Handle error (show toast, etc.)
      console.error('{PodName} creation failed', error);
    },
  });
}
```

## External Documentation

- [TanStack Query — Docs](https://tanstack.com/query/latest/docs/framework/react/overview) — full guide
- [TanStack Query — Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys) — key strategy
- [TanStack Query — Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/mutations) — `useMutation`, `onSuccess`, `onError`
- [TanStack Query — Invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation) — when and how to invalidate

The concept skill uses neutral names: `fetch` is `queryFn`, `execute` is `mutationFn`, `mutate` or `mutateAsync`, `isSubmitting` is `isPending`, `freshnessMs` is `staleTime`, and `transform` is `select`.
