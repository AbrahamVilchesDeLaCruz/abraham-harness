# State & Handlers Hook Template

Extract this pattern from the Container when it grows beyond ~80 lines of logic. Framework-free shape; the stack reference for views shows the original.

## `use{PodName}State.ts` — UI state only

```typescript
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
  // Hold selectedId (null), isModalOpen (false) and filters (DEFAULT_FILTERS) in the stack's local state primitive.

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

## `use{PodName}Handlers.ts` — async handlers with side effects

```typescript
import { useCreate{PodName}, useDelete{PodName} } from '../api/{pod-name}.api';
import type { Create{PodName}Input } from '../{pod-name}.types';

export function use{PodName}Handlers() {
  const create{PodName}Mutation = useCreate{PodName}();
  const delete{PodName}Mutation = useDelete{PodName}();

  const handleCreate = async (input: Create{PodName}Input) => {
    try {
      await create{PodName}Mutation.execute(input);
    } catch (error) {
      // Handle error — show toast, etc.
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await delete{PodName}Mutation.execute(id);
    } catch (error) {
      // Handle error
    }
  };

  return [
    {
      isCreating: create{PodName}Mutation.isSubmitting,
      isDeleting: delete{PodName}Mutation.isSubmitting,
    },
    { handleCreate, handleDelete },
  ] as const;
}
```

## Usage in Container after extraction

```tsx
export function {PodName}Container() {
  const [state, stateHandlers] = use{PodName}State();
  const { data, isLoading, isError } = use{PodName}s(state.filters);
  const [{ isCreating }, { handleCreate, handleDelete }] = use{PodName}Handlers();

  return (
    <{PodName}Component
      {podName}s={data ?? []}
      isLoading={isLoading}
      isError={isError}
      isCreating={isCreating}
      state={state}
      {...stateHandlers}
      onCreate={handleCreate}
      onDelete={handleDelete}
    />
  );
}
```

## When to extract

Extract to `use{PodName}State` when:
- Container has > 3 local state values
- Multiple state variables are updated together

Extract to `use{PodName}Handlers` when:
- Container has > 3 async handlers
- Handlers share mutation state (isSubmitting, errors)
- Handler logic needs memoization for performance

## Checklist

- [ ] State hook returns `[state, handlers]` tuple — not an object
- [ ] Handlers hook returns a tuple if it exposes state; if it only exposes functions it may return named functions
- [ ] No server-state queries or mutations in state hook — only local state
- [ ] Async handlers in `use{PodName}Handlers` — state handlers in `use{PodName}State`
- [ ] Default values for all state fields defined as constants outside the hook
