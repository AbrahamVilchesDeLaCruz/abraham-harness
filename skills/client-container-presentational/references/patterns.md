# client-container-presentational — Patterns

## Container (`*Container.{view}`)

### Example

Framework-free shape; the stack reference for views shows the original.

```tsx
// ProductsContainer.{view}
export const ProductsContainer = () => {
  // categoryId comes from the stack's routing primitive; page and setPage from its local state primitive.

  // Server state — data binding
  const { data: products, isLoading } = useProducts({ categoryId, page });
  const { execute: deleteProduct } = useDeleteProduct();

  // Callback that triggers a mutation
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

## Component (`*Component.{view}`)

### Props interface

Always declare an explicit interface for the Component's props:

```tsx
interface ProductsComponentProps {
  products: ProductVM[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onPageChange: (page: number) => void;
}
```

### Example

Framework-free shape; the stack reference for views shows the original.

```tsx
// ProductsComponent.{view}
export const ProductsComponent = ({
  products,
  isLoading,
  onDelete,
  onPageChange,
}: ProductsComponentProps) => {
  // selectedId and setSelectedId come from the stack's local state primitive.
  const [filters, filterHandlers] = useProductFilters();

  return (
    <div>
      <ProductToolbar filters={filters} onFilter={filterHandlers.setSize} />
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

## Visual contract

```
┌─────────────────────────────────────────────┐
│               Container                      │
│  (queries, mutations, route params,         │
│   store, callbacks)                         │
│                                              │
│   ┌─────────────────────────────────────┐   │
│   │           Component                  │   │
│   │  (UI state, effects, refs,          │   │
│   │   pod hooks)                        │   │
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

## Callback flow

The Component never knows how an action runs — it only receives callbacks:

```
Container                          Component
─────────                          ─────────
handleDelete = (id) =>             onDelete(id)  ← prop
  deleteProduct({ id })          ↑
                                   calls the callback
                            mutation executed in Container
```
