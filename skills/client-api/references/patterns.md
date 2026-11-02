# client-api — Patterns

## `{feature}.api-model.ts` — tipos crudos

Representa **exactamente** lo que devuelve el servidor. Snake_case si el servidor usa snake_case.

```ts
// products.api-model.ts
export interface ProductApiModel {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  next_review_at: string;   // ISO string
  created_at: string;
}

export interface CreateProductPayload {
  name: string;
  description: string;
  deck_id: string;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}
```

## `{feature}.types.ts` — ViewModel

Tipos **adaptados a la UI**. camelCase siempre. Fechas como `Date`, no strings.

```ts
// products.types.ts
export interface ProductVM {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  nextReviewAt: Date;
}
```

## `{feature}.mapper.ts` — transformación

Convierte el modelo crudo de la API al ViewModel que usa la UI.

```ts
// products.mapper.ts
import { ProductApiModel } from './api/products.api-model';
import { ProductVM } from './products.types';

export const mapProduct = (raw: ProductApiModel): ProductVM => ({
  id: raw.id,
  name: raw.name,
  description: raw.description,
  difficulty: raw.difficulty,
  nextReviewAt: new Date(raw.next_review_at),
});
```

## `{feature}.api.ts` — hooks TanStack Query

Ver skill `client-query` para el patrón completo de queries y mutations.

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

## `api/index.ts` — barrel

Re-exporta todo lo público de la capa API:

```ts
// api/index.ts
export * from './products.api';
export * from './products.api-model';
```

## `index.ts` del pod — barrel raíz

Solo exporta el Container (punto de entrada del pod):

```ts
// containers/products/index.ts
export { ProductsContainer } from './ProductsContainer';
```

## API client global

El cliente HTTP vive en `core/` y se importa desde cualquier pod:

```ts
// core/api/apiClient.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,  // para cookies httpOnly (refresh token)
});

// Interceptor de auth — añade access token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```
