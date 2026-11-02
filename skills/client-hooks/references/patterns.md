# client-hooks — Patterns

## Hooks del pod

### Patrón de retorno — tupla `[State, Handlers]`

Los hooks del pod retornan siempre una tupla para desestructurar limpiamente en el Component:

```ts
// hooks/useProductFilters.ts

interface ProductFiltersState {
  difficulty: 'easy' | 'medium' | 'hard' | null;
  showReviewOnly: boolean;
}

interface ProductFiltersHandlers {
  setDifficulty: (d: ProductFiltersState['difficulty']) => void;
  toggleReviewOnly: () => void;
  resetFilters: () => void;
}

export const useProductFilters = (): [ProductFiltersState, ProductFiltersHandlers] => {
  const [difficulty, setDifficulty] = useState<ProductFiltersState['difficulty']>(null);
  const [showReviewOnly, setShowReviewOnly] = useState(false);

  const resetFilters = () => {
    setDifficulty(null);
    setShowReviewOnly(false);
  };

  return [
    { difficulty, showReviewOnly },
    { setDifficulty, toggleReviewOnly: () => setShowReviewOnly(v => !v), resetFilters },
  ];
};
```

### Uso en el Component

```tsx
// ProductsComponent.tsx
export const ProductsComponent = ({ products, ... }: ProductsComponentProps) => {
  const [filters, filterHandlers] = useProductFilters();
  const [tooltip, tooltipHandlers] = useProductTooltip();

  return (
    <div>
      <ProductToolbar
        filters={filters}
        onFilter={filterHandlers.setDifficulty}
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

### Barrel del pod

```ts
// hooks/index.ts
export { useProductFilters } from './useProductFilters';
export { useProductTooltip } from './useProductTooltip';
export { useProductPagination } from './useProductPagination';
```

## Hooks globales

Hooks reutilizables entre pods — sin lógica de dominio.

### Ubicación

```
core/hooks/
├── useClickOutside.ts
├── useDebounce.ts
├── useLocalStorage.ts
└── index.ts
```

### Ejemplos

```ts
// useClickOutside.ts
export const useClickOutside = (
  ref: RefObject<HTMLElement>,
  handler: () => void,
) => {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) handler();
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
};
```

```ts
// useDebounce.ts
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};
```

```ts
// useLocalStorage.ts
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  const set = (newValue: T) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [value, set] as const;
};
```
