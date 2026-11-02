# Query & Mutation Hook Templates

File: `pods/{pod-name}/api/{pod-name}.api.ts`

Framework-free shapes. The stack reference for server state shows the original hooks.

## Query hook

```typescript
import { {podName}Keys } from './{pod-name}.query-keys';
import { get{PodName}s } from './{pod-name}.api-client';
import { map{PodName} } from './{pod-name}.mapper';

export function use{PodName}s(filters?: {PodName}Filters) {
  // Pass this configuration to the stack's server-state query primitive.
  return {
    queryKey: {podName}Keys.list(filters),
    fetch: async () => {
      const raw = await get{PodName}s(filters);
      return raw.map(map{PodName});
    },
  };
}

export function use{PodName}(id: string) {
  // Pass this configuration to the stack's server-state query primitive.
  return {
    queryKey: {podName}Keys.detail(id),
    fetch: async () => {
      const raw = await get{PodName}(id);
      return map{PodName}(raw);
    },
    enabled: !!id,
  };
}
```

## Mutation hook (POST / PATCH / DELETE)

```typescript
import { {podName}Keys } from './{pod-name}.query-keys';
import { create{PodName} } from './{pod-name}.api-client';

export function useCreate{PodName}() {
  // Pass this configuration to the stack's server-state mutation primitive.
  return {
    execute: (data: Create{PodName}Input) => create{PodName}(data),
    onSuccess: () => {
      // Invalidate {podName}Keys.lists() to trigger refetch of affected queries
    },
    onError: (error) => {
      // Handle error (show toast, etc.)
      console.error('{PodName} creation failed', error);
    },
  };
}
```

## Query Keys file

File: `pods/{pod-name}/api/{pod-name}.query-keys.ts`

```typescript
export const {podName}Keys = {
  all: ['{pod-name}'] as const,
  lists: () => [...{podName}Keys.all, 'list'] as const,
  list: (filters?: {PodName}Filters) => [...{podName}Keys.lists(), filters] as const,
  details: () => [...{podName}Keys.all, 'detail'] as const,
  detail: (id: string) => [...{podName}Keys.details(), id] as const,
};
```

## API client file

File: `pods/{pod-name}/api/{pod-name}.api-client.ts`

```typescript
import { apiClient } from '@/shared/api/api-client';
import type { {PodName}ApiModel } from './{pod-name}.api-model';

export async function get{PodName}s(filters?: {PodName}Filters): Promise<{PodName}ApiModel[]> {
  const { data } = await apiClient.get<{ data: {PodName}ApiModel[] }>('/{pod-name}s', {
    params: filters,
  });
  return data.data;
}

export async function get{PodName}(id: string): Promise<{PodName}ApiModel> {
  const { data } = await apiClient.get<{ data: {PodName}ApiModel }>(`/{pod-name}s/${id}`);
  return data.data;
}

export async function create{PodName}(input: Create{PodName}Input): Promise<void> {
  await apiClient.post('/{pod-name}s', input);
}
```

## Usage in Container

```typescript
export function {PodName}Container() {
  const { data: {podName}s, isLoading, isError } = use{PodName}s();
  const create{PodName}Mutation = useCreate{PodName}();

  const handle{Action} = async (input: Create{PodName}Input) => {
    await create{PodName}Mutation.execute(input);
  };

  return (
    <{PodName}Component
      {podName}s={podName}s ?? []}
      isLoading={isLoading}
      isError={isError}
      on{Action}={handle{Action}}
    />
  );
}
```
