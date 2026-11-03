# client-api — Patterns

## `{pod-name}.api-model.ts` — raw types

Represents **exactly** what the server returns: camelCase fields, dates as strings.

```ts
// products.api-model.ts
export interface ProductApiModel {
  id: string;
  name: string;
  description: string;
  size: 'small' | 'medium' | 'large';
  restockedAt: string;   // ISO string
  createdAt: string;
}

export interface ProductListParams {
  categoryId?: string;
  page?: number;
}

export interface CreateProductPayload {
  name: string;
  description: string;
  categoryId: string;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  size?: 'small' | 'medium' | 'large';
}
```

## `{pod-name}.types.ts` — ViewModel

Types **adapted to the UI**. camelCase always. Dates as `Date`, not strings.

```ts
// products.types.ts
export interface ProductVM {
  id: string;
  name: string;
  description: string;
  size: 'small' | 'medium' | 'large';
  restockedAt: Date;
}
```

## `{pod-name}.mapper.ts` — transformation

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
  restockedAt: new Date(raw.restockedAt),
});
```

## `{pod-name}.api.ts` — HTTP calls

One function per endpoint. It calls the HTTP client and returns the raw API model. Hooks do not live here.

```ts
// api/products.api.ts
import { apiClient } from '@/core/api/apiClient';
import type {
  CreateProductPayload,
  ProductApiModel,
  ProductListParams,
  UpdateProductPayload,
} from './products.api-model';

export const getProducts = async (params: ProductListParams): Promise<ProductApiModel[]> => {
  const { data } = await apiClient.get<ProductApiModel[]>('/products', { params });
  return data;
};

export const getProduct = async (id: string): Promise<ProductApiModel> => {
  const { data } = await apiClient.get<ProductApiModel>(`/products/${id}`);
  return data;
};

export const createProduct = async (payload: CreateProductPayload): Promise<ProductApiModel> => {
  const { data } = await apiClient.post<ProductApiModel>('/products', payload);
  return data;
};

export const updateProduct = async (id: string, payload: UpdateProductPayload): Promise<void> => {
  await apiClient.patch<void>(`/products/${id}`, payload);
};

export const deleteProduct = async (id: string): Promise<void> => {
  await apiClient.delete(`/products/${id}`);
};
```

## `{pod-name}.repository.ts` — ViewModels through the mapper

Lives at the pod root, next to the mapper. It calls the API client and returns ViewModels through the mapper. Only hooks call it; the Component and the Container never do.

```ts
// products.repository.ts
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from './api/products.api';
import type {
  CreateProductPayload,
  ProductListParams,
  UpdateProductPayload,
} from './api/products.api-model';
import { mapProduct } from './products.mapper';
import type { ProductVM } from './products.types';

export const productsRepository = {
  getAll: async (params: ProductListParams): Promise<ProductVM[]> => {
    const raw = await getProducts(params);
    return raw.map(mapProduct);
  },
  getById: async (id: string): Promise<ProductVM> => mapProduct(await getProduct(id)),
  create: async (payload: CreateProductPayload): Promise<ProductVM> =>
    mapProduct(await createProduct(payload)),
  update: (id: string, payload: UpdateProductPayload): Promise<void> => updateProduct(id, payload),
  remove: (id: string): Promise<void> => deleteProduct(id),
};
```

The server-state hooks that wrap these calls live in the pod's hooks file. See skill `client-query`.

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
// pods/products/index.ts
export { ProductsContainer } from './ProductsContainer';
```

## Global API client

The HTTP client lives in `core/`. A pod imports it only from `api/{pod-name}.api.ts`. It sets:

- The base URL from the environment.
- Credentials on every request, for httpOnly cookies (refresh token).
- An auth interceptor that adds the access token as `Authorization: Bearer <token>` when a token exists. It reads the token from the auth store.

The stack reference for views holds the original example.
