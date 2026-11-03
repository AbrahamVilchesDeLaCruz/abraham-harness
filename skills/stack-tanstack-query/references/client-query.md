# client-query with TanStack Query

The concept skill `client-query` defines the rules. This file holds its TanStack Query detail: how to use TanStack Query in `apps/client/`.

## Rules mapped to TanStack Query

- **`useQuery`** → in a hook of the pod's hooks file, consumed by the Container (data fetching)
- **`useMutation`** → in a hook of the pod's hooks file, consumed by the Container (side effects)
- `queryFn` and `mutationFn` call `{pod-name}.repository.ts`, never `apiClient` directly. The repository already returns ViewModels
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
// hooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productsRepository } from './products.repository';

export const useProducts = (params: ProductListParams) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productsRepository.getAll(params),
    staleTime: 1000 * 60 * 5,                  // 5 min — adjust as needed
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsRepository.getById(id),
    enabled: !!id,  // do not run without an id
  });
};
```

## useMutation — side effects

```ts
// hooks.ts
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductPayload) => productsRepository.create(data),
    onSuccess: () => {
      // Invalidates every list — the Container does not need to know how
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsRepository.remove(id),
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
      productsRepository.update(id, data),
    onSuccess: (_, { id }) => {
      // A PATCH returns 204 with no body, so refetch instead of updating the cache
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
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

File: `pods/{pod-name}/hooks.ts`.

```typescript
import { useQuery } from '@tanstack/react-query';
import { {podName}Repository } from './{pod-name}.repository';

export function use{PodName}s(filters?: {PodName}Filters) {
  return useQuery({
    queryKey: {podName}Keys.list(filters),
    queryFn: () => {podName}Repository.getAll(filters),
  });
}

export function use{PodName}(id: string) {
  return useQuery({
    queryKey: {podName}Keys.detail(id),
    queryFn: () => {podName}Repository.getById(id),
    enabled: !!id,
  });
}
```

## useMutation hook template (POST / PATCH / DELETE)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { {podName}Repository } from './{pod-name}.repository';

export function useCreate{PodName}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Create{PodName}Input) => {podName}Repository.create(data),
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

## Usage in Container

```typescript
import { use{PodName}s, useCreate{PodName} } from './hooks';

export function {PodName}Container() {
  const { data: {podName}s, isLoading, isError } = use{PodName}s();
  const create{PodName}Mutation = useCreate{PodName}();

  const handle{Action} = async (input: Create{PodName}Input) => {
    await create{PodName}Mutation.mutateAsync(input);
  };

  return (
    <{PodName}Component
      {podName}s={{podName}s ?? []}
      isLoading={isLoading}
      isError={isError}
      on{Action}={handle{Action}}
    />
  );
}
```

## External Documentation

- [TanStack Query — Docs](https://tanstack.com/query/latest/docs/framework/react/overview) — full guide
- [TanStack Query — Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys) — key strategy
- [TanStack Query — Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/mutations) — `useMutation`, `onSuccess`, `onError`
- [TanStack Query — Invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation) — when and how to invalidate

The concept skill uses neutral names: `serverQuery` is `useQuery`, `serverMutation` is `useMutation`, `key` is `queryKey`, `onDone` is `onSuccess`, `onFailure` is `onError`, `fetch` is `queryFn`, `execute` is `mutationFn`, `mutate` or `mutateAsync`, `isSubmitting` is `isPending`, and `freshnessMs` is `staleTime`.
