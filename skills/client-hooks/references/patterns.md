# client-hooks — Patterns

## Pod hooks

### Return pattern — object with named fields

Every hook, pod or global, returns an object with named fields, also when it exposes state, to destructure cleanly in the Container. No tuples. Framework-free shape; the stack reference for views shows the original.

```ts
// hooks/useProductFilters.ts

type ProductSize = 'small' | 'medium' | 'large';

export function useProductFilters() {
  // size starts at null and showFeaturedOnly at false, held in the stack's local state primitive.

  const resetFilters = () => {
    setSize(null);
    setShowFeaturedOnly(false);
  };

  return {
    size,
    showFeaturedOnly,
    setSize,
    toggleFeaturedOnly: () => setShowFeaturedOnly(v => !v),
    resetFilters,
  };
}
```

### Usage in the Container

The Container consumes the pod's hooks, and passes data and callbacks to the Component. The Component renders what it receives.

```tsx
// ProductsContainer.{view}
export const ProductsContainer = () => {
  // categoryId comes from the stack's routing primitive; page from its local state primitive.
  const { data: products = [] } = useProducts({ categoryId, page });
  const { size, showFeaturedOnly, setSize, resetFilters } = useProductFilters();
  const { tooltip, showTooltip, closeTooltip } = useProductTooltip();

  return (
    <ProductsComponent
      products={products}
      size={size}
      showFeaturedOnly={showFeaturedOnly}
      tooltip={tooltip}
      onFilter={setSize}
      onResetFilters={resetFilters}
      onShowTooltip={showTooltip}
      onCloseTooltip={closeTooltip}
    />
  );
};
```

### Pod barrel

```ts
// hooks/index.ts
export { useProducts } from './useProducts';
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
- `useLocalStorage` takes a key and an initial value. It starts from the stored JSON if it exists, otherwise from the initial value, and returns `{ value, set }`. `set` updates the value and writes it to `localStorage`.
