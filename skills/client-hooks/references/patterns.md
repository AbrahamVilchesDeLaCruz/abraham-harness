# client-hooks — Patterns

## Pod hooks

### Return pattern — `[State, Handlers]` tuple

A pod hook that exposes state returns a tuple, to destructure cleanly in the Component. A hook that only exposes functions may return named functions. Framework-free shape; the stack reference for views shows the original.

```ts
// hooks/useProductFilters.ts

interface ProductFiltersState {
  size: 'small' | 'medium' | 'large' | null;
  showFeaturedOnly: boolean;
}

interface ProductFiltersHandlers {
  setSize: (d: ProductFiltersState['size']) => void;
  toggleFeaturedOnly: () => void;
  resetFilters: () => void;
}

export function useProductFilters(): [ProductFiltersState, ProductFiltersHandlers] {
  // size starts at null and showFeaturedOnly at false, held in the stack's local state primitive.

  const resetFilters = () => {
    setSize(null);
    setShowReviewOnly(false);
  };

  return [
    { size, showFeaturedOnly },
    { setSize, toggleFeaturedOnly: () => setShowReviewOnly(v => !v), resetFilters },
  ];
}
```

### Usage in the Component

```tsx
// ProductsComponent.{view}
export const ProductsComponent = ({ products, ... }: ProductsComponentProps) => {
  const [filters, filterHandlers] = useProductFilters();
  const [tooltip, tooltipHandlers] = useProductTooltip();

  return (
    <div>
      <ProductToolbar
        filters={filters}
        onFilter={filterHandlers.setSize}
        onReset={filterHandlers.resetFilters}
      />
      {products.map(product => (
        <ProductItem
          key={product.id}
          product={product}
          onHover={tooltipHandlers.show}
        />
      ))}
      {tooltip.visible && <ProductTooltip {...tooltip} onClose={tooltipHandlers.close} />}
    </div>
  );
};
```

### Pod barrel

```ts
// hooks/index.ts
export { useProductFilters } from './useProductFilters';
export { useProductTooltip } from './useProductTooltip';
export { useProductPagination } from './useProductPagination';
```

## Global hooks

Hooks reusable across pods — with no domain logic.

### Location

```
core/hooks/
├── useClickOutside.ts
├── useDebounce.ts
├── useLocalStorage.ts
└── index.ts
```

### Examples

The stack reference for views holds the original code of each example.

- `useClickOutside` takes a ref to an element and a handler. It listens for `mousedown` on `document`, calls the handler when the event target is outside the element, and removes the listener on cleanup.
- `useDebounce` takes a value and a delay and returns the debounced value. A timer updates it after the delay, and cleanup clears the timer.
- `useLocalStorage` takes a key and an initial value. It starts from the stored JSON if it exists, otherwise from the initial value, and returns `[value, set]`. `set` updates the value and writes it to `localStorage`.
