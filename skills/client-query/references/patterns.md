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
// hooks.ts
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductListParams) => [...productKeys.lists(), params] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
};
```

## Queries — data fetching

A query hook wraps a repository call. The repository calls the API client and returns ViewModels through the mapper.

```ts
// hooks.ts
import { productsRepository } from './products.repository';

export const useProducts = (params: ProductListParams) => {
  return serverQuery({
    key: productKeys.list(params),
    fetch: () => productsRepository.getAll(params),
    freshnessMs: 1000 * 60 * 5,                  // 5 min — adjust as needed
  });
};

export const useProduct = (id: string) => {
  return serverQuery({
    key: productKeys.detail(id),
    fetch: () => productsRepository.getById(id),
    enabled: !!id,  // do not run without an id
  });
};
```

## Mutations — side effects

```ts
// hooks.ts
export const useCreateProduct = () => {
  return serverMutation({
    execute: (data: CreateProductPayload) => productsRepository.create(data),
    onDone: () => {
      // Invalidates every list (productKeys.lists()) — the Container does not need to know how
    },
  });
};

export const useDeleteProduct = () => {
  return serverMutation({
    execute: (id: string) => productsRepository.remove(id),
    onDone: (_, id) => {
      // Invalidates productKeys.lists() and removes the cache entry at productKeys.detail(id)
    },
  });
};

export const useUpdateProduct = () => {
  return serverMutation({
    execute: ({ id, data }: { id: string; data: UpdateProductPayload }) =>
      productsRepository.update(id, data),
    onDone: (_, { id }) => {
      // A PATCH returns 204 with no body, so refetch instead of updating the cache
      // Invalidates productKeys.detail(id) and productKeys.lists()
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
