# client-container-presentational with React

The concept skill `client-container-presentational` defines the rules. This file maps them to React.

## Container (`*Container.tsx`)

Exclusive responsibilities:

- Routing: `useParams`, `useLocation`, `useNavigate`, `useSearchParams`
- Global context: Zustand store, `useContext`
- `useMemo` to derive query params (never `useState` for derived values)

Prohibitions:

- ❌ Calling the repository, `apiClient` or `fetch` directly
- ❌ `useState` for purely visual state (modals, tooltips, toggles) — it may stay in the Component
- ❌ Complex JSX — renders only `<{PodName}Component />` with props
- ❌ `useEffect`, except a trivial sync outward

### Example

```tsx
// ProductsContainer.tsx
export const ProductsContainer = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [page, setPage] = useState(1);

  // Pod hooks — each one reaches the data through the repository
  const { data: products, isLoading } = useProducts({ categoryId, page });
  const { mutate: deleteProduct } = useDeleteProduct();
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

## Component (`*Component.tsx`)

Responsibilities:

- Purely visual local state: `useState` for modals, tooltips, toggles
- `useEffect` to sync local UI state
- `useRef` for third-party components, scroll, focus

Prohibitions:

- ❌ Pod hooks, the repository, `apiClient` — the Container consumes the hooks
- ❌ `useParams`, `useNavigate`, `useLocation` — it does not access routing
- ❌ Zustand store or global `useContext`

### Example

```tsx
// ProductsComponent.tsx
export const ProductsComponent = ({
  products,
  isLoading,
  size,
  onDelete,
  onFilter,
  onPageChange,
}: ProductsComponentProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
│  (pod hooks, useParams,                     │
│   Zustand, callbacks)                       │
│                                              │
│   ┌─────────────────────────────────────┐   │
│   │           Component                  │   │
│   │  (visual useState, useEffect,       │   │
│   │   useRef, renders what it receives) │   │
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

## Templates

### Container — `{PodName}Container.tsx`

```tsx
import { use{PodName}s, useCreate{PodName} } from './hooks';
import { {PodName}Component } from './{PodName}Component';
import type { Create{PodName}Input } from './{pod-name}.types';

export function {PodName}Container() {
  // 1. Consume the pod hooks here — they reach the data through the repository
  const { data: {podName}s, isLoading, isError } = use{PodName}s();
  const create{PodName}Mutation = useCreate{PodName}();

  // 2. All event handlers here
  const handleCreate = async (input: Create{PodName}Input) => {
    await create{PodName}Mutation.mutateAsync(input);
  };

  const handleDelete = async (id: string) => {
    // await delete{PodName}Mutation.mutateAsync(id);
  };

  // 3. Minimal JSX — just delegates to Component
  return (
    <{PodName}Component
      {podName}s={{podName}s ?? []}
      isLoading={isLoading}
      isError={isError}
      onCreate={handleCreate}
      onDelete={handleDelete}
    />
  );
}
```

### Component — `{PodName}Component.tsx`

```tsx
import type { {PodName}VM, Create{PodName}Input } from './{pod-name}.types';

type {PodName}ComponentProps = {
  {podName}s: {PodName}VM[];
  isLoading: boolean;
  isError: boolean;
  onCreate: (input: Create{PodName}Input) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function {PodName}Component({
  {podName}s,
  isLoading,
  isError,
  onCreate,
  onDelete,
}: {PodName}ComponentProps) {
  if (isLoading) return <div role="progressbar">Loading...</div>;
  if (isError) return <div role="alert">Something went wrong</div>;

  return (
    <div>
      {/* Pure UI — no queries, no mutations, no side effects */}
      {/* All interactions via props callbacks */}
      {{podName}s.map(({podName}) => (
        <article key={{podName}.id}>
          <p>{{podName}.someField}</p>
          <button onClick={() => onDelete({podName}.id)}>Delete</button>
        </article>
      ))}
    </div>
  );
}
```

## Contract rules (summary)

| Rule | Container | Component |
|---|---|---|
| Pod hooks, TanStack Query hooks included | ✅ Yes | ❌ Never |
| Repository, `apiClient`, `fetch` | ❌ Never | ❌ Never |
| `useState` for purely visual state | ❌ Avoid | ✅ Yes |
| JSX complexity | ❌ Minimal | ✅ Full UI |
| Test approach | RTL + MSW | RTL with mocked props |

## Checklist

- [ ] Container has zero styling / JSX beyond the Component call
- [ ] Container consumes the pod hooks, and never calls the repository directly
- [ ] Component has zero pod hooks, `useQuery`, `useMutation`, `fetch` calls
- [ ] Container handles async errors (try/catch or mutation `onError`)

## External Documentation

- [React — Thinking in React](https://react.dev/learn/thinking-in-react) — philosophy of UI/data separation

In the concept skill, `.{view}` means `.tsx` in this stack.
