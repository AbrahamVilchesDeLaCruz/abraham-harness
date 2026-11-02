# client-container-presentational — Patterns

## Container (`*Container.tsx`)

### Ejemplo

```tsx
// ProductsContainer.tsx
export const ProductsContainer = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const [page, setPage] = useState(1);

  // TanStack Query — data binding
  const { data: products, isLoading } = useProducts({ deckId, page });
  const { mutate: deleteProduct } = useDeleteProduct();

  // Callback que dispara mutation
  const handleDelete = (id: string) => deleteProduct({ id });

  return (
    <ProductsComponent
      products={products ?? []}
      isLoading={isLoading}
      onDelete={handleDelete}
      onPageChange={setPage}
    />
  );
};
```

## Component (`*Component.tsx`)

### Props interface

Siempre declarar una interface explícita para las props del Component:

```tsx
interface ProductsComponentProps {
  products: ProductVM[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onPageChange: (page: number) => void;
}
```

### Ejemplo

```tsx
// ProductsComponent.tsx
export const ProductsComponent = ({
  products,
  isLoading,
  onDelete,
  onPageChange,
}: ProductsComponentProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filters, filterHandlers] = useProductFilters();

  return (
    <div>
      <ProductToolbar filters={filters} onFilter={filterHandlers.setDifficulty} />
      <ProductGrid
        products={products}
        isLoading={isLoading}
        onSelect={setSelectedId}
        onDelete={onDelete}
      />
      {selectedId && (
        <ProductDetailPopup
          id={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
};
```

## Contrato visual

```
┌─────────────────────────────────────────────┐
│               Container                      │
│  (useQuery, useMutation, useParams,         │
│   Zustand, callbacks)                       │
│                                              │
│   ┌─────────────────────────────────────┐   │
│   │           Component                  │   │
│   │  (useState UI, useEffect, useRef,   │   │
│   │   hooks del pod)                    │   │
│   │                                      │   │
│   │  ┌──────────┐  ┌──────────────────┐ │   │
│   │  │ Toolbar  │  │  FilterChips     │ │   │
│   │  └──────────┘  └──────────────────┘ │   │
│   │  ┌──────────────────────────────────┐│   │
│   │  │           Grid                   ││   │
│   │  └──────────────────────────────────┘│   │
│   │  ┌──────────┐  ┌──────────────────┐ │   │
│   │  │  Popup   │  │    Tooltip       │ │   │
│   │  └──────────┘  └──────────────────┘ │   │
│   └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## Flujo de callbacks

El Component nunca sabe cómo se ejecuta una acción — solo recibe callbacks:

```
Container                          Component
─────────                          ─────────
handleDelete = (id) =>             onDelete(id)  ← prop
  deleteProduct({ id })          ↑
                                   llama al callback
                            mutation ejecutada en Container
```
