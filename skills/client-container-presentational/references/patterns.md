# client-container-presentational — Patterns

## Container (`*Container.{view}`)

### Example

Framework-free shape; the stack reference for views shows the original.

```tsx
// ProductsContainer.{view}
export const ProductsContainer = () => {
  // categoryId comes from the stack's routing primitive; page and setPage from its local state primitive.

  // Pod hooks — each one reaches the data through the repository
  const { data: products, isLoading } = useProducts({ categoryId, page });
  const { execute: deleteProduct } = useDeleteProduct();
  const { size, setSize } = useProductFilters();

  // Callback that triggers a mutation
  const handleDelete = (id: string) => deleteProduct(id);

  return (
    <ProductsComponent
      products={products ?? []}
      isLoading={isLoading}
      size={size}
      onDelete={handleDelete}
      onFilter={setSize}
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
  size: ProductSize | null;
  onDelete: (id: string) => void;
  onFilter: (size: ProductSize | null) => void;
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
  size,
  onDelete,
  onFilter,
  onPageChange,
}: ProductsComponentProps) => {
  // selectedId and setSelectedId come from the stack's local state primitive: purely visual.

  return (
    <div>
      <ProductToolbar size={size} onFilter={onFilter} />
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
│  (pod hooks, route params,                  │
│   store, callbacks)                         │
│                                              │
│   ┌─────────────────────────────────────┐   │
│   │           Component                  │   │
│   │  (visual state, effects, refs,      │   │
│   │   renders what it receives)         │   │
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
  deleteProduct(id)              ↑
                                   calls the callback
                            mutation executed in Container
```
