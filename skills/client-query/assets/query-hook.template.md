# Query & Mutation Hook Templates

File: `pods/{pod-name}/hooks.ts`. In a `hooks/` folder, each hook has its own file and the keys go in `hooks/{pod-name}.keys.ts`.

`serverQuery` and `serverMutation` stand for the query and mutation primitives of the stack's server-state library. The stack reference for server state shows the original hooks.

Each hook wraps a repository call. The repository and the HTTP calls are in skill `client-api`, in `assets/api-layer.template.md`.

## Query Keys

```typescript
export const {podName}Keys = {
  all: ['{pod-name}'] as const,
  lists: () => [...{podName}Keys.all, 'list'] as const,
  list: (filters?: {PodName}Filters) => [...{podName}Keys.lists(), filters] as const,
  details: () => [...{podName}Keys.all, 'detail'] as const,
  detail: (id: string) => [...{podName}Keys.details(), id] as const,
};
```

## Query hook

```typescript
import { {podName}Repository } from './{pod-name}.repository';

export function use{PodName}s(filters?: {PodName}Filters) {
  return serverQuery({
    key: {podName}Keys.list(filters),
    fetch: () => {podName}Repository.getAll(filters),
  });
}

export function use{PodName}(id: string) {
  return serverQuery({
    key: {podName}Keys.detail(id),
    fetch: () => {podName}Repository.getById(id),
    enabled: !!id,
  });
}
```

## Mutation hook (POST / PATCH / DELETE)

```typescript
export function useCreate{PodName}() {
  return serverMutation({
    execute: (data: Create{PodName}Input) => {podName}Repository.create(data),
    onDone: () => {
      // Invalidate {podName}Keys.lists() to trigger refetch of affected queries
    },
    onFailure: (error) => {
      // Handle error (show toast, etc.)
      console.error('{PodName} creation failed', error);
    },
  });
}
```

## Usage in Container

```typescript
import { use{PodName}s, useCreate{PodName} } from './hooks';

export function {PodName}Container() {
  const { data: {podName}s, isLoading, isError } = use{PodName}s();
  const create{PodName}Mutation = useCreate{PodName}();

  const handle{Action} = async (input: Create{PodName}Input) => {
    await create{PodName}Mutation.execute(input);
  };

  return (
    <{PodName}Component
      {podName}s={{podName}s ?? []}
      isLoading={isLoading}
      isError={isError}
      on{Action}={handle{Action}}
    />
  );
}
```
