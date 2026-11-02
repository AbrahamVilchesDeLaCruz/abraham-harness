# client-query — Patterns

`serverQuery` and `serverMutation` stand for the query and mutation primitives of the stack's server-state library. `serverQuery` returns `data`, `isLoading`, `isError` and `isFetching`; `serverMutation` returns `execute` and `isSubmitting`. The stack reference for server state shows the original code.

## Query Keys

Query keys are arrays. They must be **consistent** within the pod:

```ts
// Pattern: [domain, resource, params]
['products', 'list', { categoryId, page }]
['products', 'detail', productId]
['reviews', 'payments', { userId }]
```

Export the keys as constants to reuse them in invalidations:

```ts
// products.api.ts
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductListParams) => [...productKeys.lists(), params] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
};
```

## Queries — data fetching

```ts
// products.api.ts
export const useProducts = (params: ProductListParams) => {
  return serverQuery({
    key: productKeys.list(params),
    fetch: () => apiClient.get<ProductApiModel[]>('/products', { params }),
    transform: (data) => data.map(mapProduct),  // mapper here if simple
    freshnessMs: 1000 * 60 * 5,                  // 5 min — adjust as needed
  });
};

export const useProduct = (id: string) => {
  return serverQuery({
    key: productKeys.detail(id),
    fetch: () => apiClient.get<ProductApiModel>(`/products/${id}`),
    transform: mapProduct,
    enabled: !!id,  // do not run without an id
  });
};
```

## Mutations — side effects

```ts
// products.api.ts
export const useCreateProduct = () => {
  return serverMutation({
    execute: (data: CreateProductPayload) =>
      apiClient.post<ProductApiModel>('/products', data),
    onDone: () => {
      // Invalidates every list (productKeys.lists()) — the Container does not need to know how
    },
  });
};

export const useDeleteProduct = () => {
  return serverMutation({
    execute: (id: string) => apiClient.delete(`/products/${id}`),
    onDone: (_, id) => {
      // Invalidates productKeys.lists() and removes the cache entry at productKeys.detail(id)
    },
  });
};

export const useUpdateProduct = () => {
  return serverMutation({
    execute: ({ id, data }: { id: string; data: UpdateProductPayload }) =>
      apiClient.patch<ProductApiModel>(`/products/${id}`, data),
    onDone: (updated) => {
      // Updates the cache directly at productKeys.detail(updated.id) — avoids an unnecessary refetch
      // Invalidates productKeys.lists()
    },
  });
};
```

## Usage in the Container

```tsx
// ProductsContainer.{view}
export const ProductsContainer = () => {
  // categoryId comes from the stack's routing primitive; page and setPage from its local state primitive.

  const { data: products = [], isLoading, isError } = useProducts({ categoryId, page });
  const { execute: deleteProduct, isSubmitting: isDeleting } = useDeleteProduct();

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

Use the server-state library's own states directly — do not duplicate them in local state:

```tsx
// ✅ correct
const { data, isLoading, isError, isFetching } = useProducts(params);

// ❌ incorrect — duplicating state: a separate loading value held in local state
```

## Default freshness window

Configure it in the global server-state client (`core/`): queries are fresh for 2 minutes by default, and failed queries retry once.

Override per query only when necessary (very dynamic data → `0`, static data → `Infinity`).
