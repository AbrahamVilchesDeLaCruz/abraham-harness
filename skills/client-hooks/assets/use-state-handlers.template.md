# State & Handlers Hook Template

Extract this pattern from the Container when it grows beyond ~80 lines of logic. Framework-free shape; the stack reference for views shows the original.

## `use{PodName}State.ts` — UI state only

```typescript
export type {PodName}Filters = {
  search: string;
  status: 'active' | 'inactive' | null;
};

const DEFAULT_FILTERS: {PodName}Filters = {
  search: '',
  status: null,
};

export function use{PodName}State() {
  // Hold selectedId (null), isModalOpen (false) and filters (DEFAULT_FILTERS) in the stack's local state primitive.

  return {
    selectedId,
    isModalOpen,
    filters,
    selectItem: (id: string) => setSelectedId(id),
    clearSelection: () => setSelectedId(null),
    openModal: () => setIsModalOpen(true),
    closeModal: () => setIsModalOpen(false),
    setFilter: <K extends keyof {PodName}Filters>(key: K, value: {PodName}Filters[K]) => {
      setFilters(prev => ({ ...prev, [key]: value }));
    },
    resetFilters: () => setFilters(DEFAULT_FILTERS),
  };
}
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

  return {
    isCreating: create{PodName}Mutation.isSubmitting,
    isDeleting: delete{PodName}Mutation.isSubmitting,
    handleCreate,
    handleDelete,
  };
}
```

## Usage in Container after extraction

```tsx
export function {PodName}Container() {
  const {
    selectedId,
    isModalOpen,
    filters,
    selectItem,
    clearSelection,
    openModal,
    closeModal,
    setFilter,
    resetFilters,
  } = use{PodName}State();
  const { data, isLoading, isError } = use{PodName}s(filters);
  const { isCreating, handleCreate, handleDelete } = use{PodName}Handlers();

  return (
    <{PodName}Component
      {podName}s={data ?? []}
      isLoading={isLoading}
      isError={isError}
      isCreating={isCreating}
      selectedId={selectedId}
      isModalOpen={isModalOpen}
      filters={filters}
      onSelect={selectItem}
      onClearSelection={clearSelection}
      onOpenModal={openModal}
      onCloseModal={closeModal}
      onFilter={setFilter}
      onResetFilters={resetFilters}
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

- [ ] State hook returns an object with named fields, for state and functions alike
- [ ] Handlers hook returns an object with named fields, also when it exposes state
- [ ] No server-state queries or mutations in state hook — only local state
- [ ] Async handlers in `use{PodName}Handlers` — state handlers in `use{PodName}State`
- [ ] Default values for all state fields defined as constants outside the hook
