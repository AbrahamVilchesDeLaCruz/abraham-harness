# client-hooks with React

The concept skill `client-hooks` defines the rules. This file maps them to React.

- Create a pod hook when there is a cohesive group of `useState` + handlers.
- When the Component has more than ~5 `useState` calls, that is a sign that there are hooks to extract.

## Return pattern — `[State, Handlers]` tuple

A pod hook that exposes state returns a tuple. A hook that only exposes functions may return named functions.

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
  const [size, setSize] = useState<ProductFiltersState['size']>(null);
  const [showFeaturedOnly, setShowReviewOnly] = useState(false);

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

## Global hooks

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

## State hook template — `use{PodName}State.ts`

```typescript
import { useState } from 'react';

export type {PodName}State = {
  selectedId: string | null;
  isModalOpen: boolean;
  filters: {PodName}Filters;
};

export type {PodName}Filters = {
  search: string;
  status: 'active' | 'inactive' | null;
};

const DEFAULT_FILTERS: {PodName}Filters = {
  search: '',
  status: null,
};

export function use{PodName}State(): [{PodName}State, {PodName}StateHandlers] {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<{PodName}Filters>(DEFAULT_FILTERS);

  const handlers: {PodName}StateHandlers = {
    selectItem: (id: string) => setSelectedId(id),
    clearSelection: () => setSelectedId(null),
    openModal: () => setIsModalOpen(true),
    closeModal: () => setIsModalOpen(false),
    setFilter: <K extends keyof {PodName}Filters>(key: K, value: {PodName}Filters[K]) => {
      setFilters(prev => ({ ...prev, [key]: value }));
    },
    resetFilters: () => setFilters(DEFAULT_FILTERS),
  };

  return [{ selectedId, isModalOpen, filters }, handlers];
}

export type {PodName}StateHandlers = {
  selectItem: (id: string) => void;
  clearSelection: () => void;
  openModal: () => void;
  closeModal: () => void;
  setFilter: <K extends keyof {PodName}Filters>(key: K, value: {PodName}Filters[K]) => void;
  resetFilters: () => void;
};
```

## Handlers hook template — `use{PodName}Handlers.ts`

```typescript
import { useCallback } from 'react';
import { useCreate{PodName}, useDelete{PodName} } from '../api/{pod-name}.api';
import type { Create{PodName}Input } from '../{pod-name}.types';

export function use{PodName}Handlers() {
  const create{PodName}Mutation = useCreate{PodName}();
  const delete{PodName}Mutation = useDelete{PodName}();

  const handleCreate = useCallback(async (input: Create{PodName}Input) => {
    try {
      await create{PodName}Mutation.mutateAsync(input);
    } catch (error) {
      // Handle error — show toast, etc.
    }
  }, [create{PodName}Mutation]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await delete{PodName}Mutation.mutateAsync(id);
    } catch (error) {
      // Handle error
    }
  }, [delete{PodName}Mutation]);

  return [
    {
      isCreating: create{PodName}Mutation.isPending,
      isDeleting: delete{PodName}Mutation.isPending,
    },
    { handleCreate, handleDelete },
  ] as const;
}
```

## When to extract

The concept skill lists every trigger. In React terms: extract to `use{PodName}State` when the Container has > 3 `useState` calls, and extract to `use{PodName}Handlers` when handler logic needs `useCallback` for performance.

## Tuple rationale

The `[state, handlers]` tuple pattern is inspired by `useState`.

## External Documentation

- [React — Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks) — when and how to extract
- [React — Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks) — rules that apply to custom hooks
- [React — `useCallback`](https://react.dev/reference/react/useCallback) — when to memoize handlers

In the concept skill, `.{view}` means `.tsx` in this stack.
