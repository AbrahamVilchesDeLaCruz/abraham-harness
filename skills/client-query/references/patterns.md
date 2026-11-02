# client-query — Patterns

## Query Keys

Las query keys son arrays. Deben ser **consistentes** dentro del pod:

```ts
// Patrón: [dominio, recurso, params]
['products', 'list', { deckId, page }]
['products', 'detail', productId]
['reviews', 'payments', { userId }]
```

Exportar las keys como constantes para reutilizarlas en invalidaciones:

```ts
// products.api.ts
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductListParams) => [...productKeys.lists(), params] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
};
```

## useQuery — data fetching

```ts
// products.api.ts
export const useProducts = (params: ProductListParams) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => apiClient.get<ProductApiModel[]>('/products', { params }),
    select: (data) => data.map(mapProduct),  // mapper aquí si es simple
    staleTime: 1000 * 60 * 5,                  // 5 min — ajustar según necesidad
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => apiClient.get<ProductApiModel>(`/products/${id}`),
    select: mapProduct,
    enabled: !!id,  // no ejecutar si no hay id
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
      // Invalida todas las listas — el Container no necesita saber cómo
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
      // Actualiza el cache directamente — evita refetch innecesario
      queryClient.setQueryData(productKeys.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};
```

## Uso en el Container

```tsx
// ProductsContainer.tsx
export const ProductsContainer = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const [page, setPage] = useState(1);

  const { data: products = [], isLoading, isError } = useProducts({ deckId, page });
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

## Estados de UI de la query

Usar los estados de TanStack Query directamente — no duplicar en `useState`:

```tsx
// ✅ correcto
const { data, isLoading, isError, isFetching } = useProducts(params);

// ❌ incorrecto — duplicar estado
const [loading, setLoading] = useState(false);
```

## staleTime por defecto

Configurar en el `QueryClient` global (`core/`):

```ts
// core/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,  // 2 min por defecto
      retry: 1,
    },
  },
});
```

Sobreescribir por query solo cuando sea necesario (datos muy dinámicos → `staleTime: 0`, datos estáticos → `staleTime: Infinity`).
