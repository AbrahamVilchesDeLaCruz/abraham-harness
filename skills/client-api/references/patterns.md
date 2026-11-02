# client-api — Patterns

## `{feature}.api-model.ts` — raw types

Represents **exactly** what the server returns. Snake_case if the server uses snake_case.

```ts
// products.api-model.ts
export interface ProductApiModel {
  id: string;
  name: string;
  description: string;
  size: 'small' | 'medium' | 'large';
  restocked_at: string;   // ISO string
  created_at: string;
}

export interface CreateProductPayload {
  name: string;
  description: string;
  category_id: string;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  size?: 'small' | 'medium' | 'large';
}
```

## `{feature}.types.ts` — ViewModel

Types **adapted to the UI**. camelCase always. Dates as `Date`, not strings.

```ts
// products.types.ts
export interface ProductVM {
  id: string;
  name: string;
  description: string;
  size: 'small' | 'medium' | 'large';
  nextReviewAt: Date;
}
```

## `{feature}.mapper.ts` — transformation

Converts the raw API model to the ViewModel the UI uses.

```ts
// products.mapper.ts
import { ProductApiModel } from './api/products.api-model';
import { ProductVM } from './products.types';

export const mapProduct = (raw: ProductApiModel): ProductVM => ({
  id: raw.id,
  name: raw.name,
  description: raw.description,
  size: raw.size,
  nextReviewAt: new Date(raw.restocked_at),
});
```

## `{feature}.api.ts` — server-state hooks

See skill `client-query` for the full query and mutation pattern. Framework-free shape; the stack reference shows the real hook.

```ts
// products.api.ts
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductListParams) => [...productKeys.lists(), params] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
};

export const useProducts = (params: ProductListParams) => {
  // Pass this configuration to the stack's server-state query primitive.
  return {
    queryKey: productKeys.list(params),
    fetch: () => apiClient.get<ProductApiModel[]>('/products', { params }),
    transform: (data) => data.map(mapProduct),
  };
};
```

## `api/index.ts` — barrel

Re-exports everything public from the API layer:

```ts
// api/index.ts
export * from './products.api';
export * from './products.api-model';
```

## The pod's `index.ts` — root barrel

Exports only the Container (the pod's entry point):

```ts
// containers/products/index.ts
export { ProductsContainer } from './ProductsContainer';
```

## Global API client

The HTTP client lives in `core/` and is imported from any pod. It sets:

- The base URL from the environment.
- Credentials on every request, for httpOnly cookies (refresh token).
- An auth interceptor that adds the access token as `Authorization: Bearer <token>` when a token exists. It reads the token from the auth store.

The stack reference for views holds the original example.
