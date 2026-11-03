# API Layer Template

File structure for the `api/` folder inside a pod, plus the repository and the mapper at the pod root.

## `{pod-name}.api-model.ts` — Raw API types

```typescript
// Raw response from the backend — camelCase fields, strings for dates
export type {PodName}ApiModel = {
  id: string;
  userId: string | null;
  someField: string;
  numericField: number;
  status: '{status-a}' | '{status-b}';
  createdAt: string;        // ISO string from API
  updatedAt: string | null;
};

// For paginated responses
export type {PodName}ListApiResponse = {
  data: {PodName}ApiModel[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
};
```

## `{pod-name}.api.ts` — HTTP calls

Only the HTTP calls. Server-state hooks live in the pod's hooks file.

```typescript
import { apiClient } from '@/core/api/apiClient';
import type { {PodName}ApiModel } from './{pod-name}.api-model';
import type { {PodName}Filters, Create{PodName}Input } from '../{pod-name}.types';

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

## `{pod-name}.repository.ts` — calls the API client, returns ViewModels

This file lives at the pod root, next to the mapper. Only hooks call it; the Component and the Container never do.

```typescript
import { create{PodName}, get{PodName}, get{PodName}s } from './api/{pod-name}.api';
import { map{PodName} } from './{pod-name}.mapper';
import type { {PodName}Filters, {PodName}VM, Create{PodName}Input } from './{pod-name}.types';

export const {podName}Repository = {
  getAll: async (filters?: {PodName}Filters): Promise<{PodName}VM[]> => {
    const raw = await get{PodName}s(filters);
    return raw.map(map{PodName});
  },
  getById: async (id: string): Promise<{PodName}VM> => map{PodName}(await get{PodName}(id)),
  create: (input: Create{PodName}Input): Promise<void> => create{PodName}(input),
};
```

## `{pod-name}.mapper.ts` — ApiModel → ViewModel

This file lives at the pod root, not in `api/`.

```typescript
import type { {PodName}ApiModel } from './api/{pod-name}.api-model';
import type { {PodName}VM } from './{pod-name}.types';

export function map{PodName}({raw}: {PodName}ApiModel): {PodName}VM {
  return {
    id: raw.id,
    someField: raw.someField,
    status: raw.status,
    isAssigned: raw.userId !== null,
    createdAt: new Date(raw.createdAt),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : null,
  };
}
```

## `{pod-name}.types.ts` — ViewModel types

```typescript
// camelCase, Date for temporal fields — no API details leak here
export type {PodName}VM = {
  id: string;
  someField: string;
  status: '{status-a}' | '{status-b}';
  isAssigned: boolean;
  createdAt: Date;
  updatedAt: Date | null;
};

// Filters of the list (what the hooks and the repository receive)
export type {PodName}Filters = {
  search: string;
  status: 'active' | 'inactive' | null;
};

// Input type for mutations (what the form sends)
export type Create{PodName}Input = {
  someField: string;
  numericField: number;
};
```

## Checklist

- [ ] `api/` holds only the raw model and the HTTP calls — no hooks
- [ ] The repository is at the pod root, calls the API client and returns ViewModels through the mapper
- [ ] `api-model` uses `camelCase` — mirrors the JSON that arrives from the API
- [ ] ViewModel uses `camelCase` — TypeScript/JavaScript convention
- [ ] Dates: `string` in ApiModel → `Date` in ViewModel (the mapper does the conversion)
- [ ] The mapper is a pure function — easy to unit test
- [ ] Nullables: `null` in ApiModel → `null` in ViewModel (not `undefined`)
- [ ] ViewModel types **do not import** anything from `api-model` or the API
