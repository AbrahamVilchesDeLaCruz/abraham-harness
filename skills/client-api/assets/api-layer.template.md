# API Layer Template

File structure for the `api/` folder inside a pod, plus the mapper at the pod root.

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

// Input type for mutations (what the form sends)
export type Create{PodName}Input = {
  someField: string;
  numericField: number;
};
```

## Checklist

- [ ] `api-model` uses `camelCase` — mirrors the JSON that arrives from the API
- [ ] ViewModel uses `camelCase` — TypeScript/JavaScript convention
- [ ] Dates: `string` in ApiModel → `Date` in ViewModel (the mapper does the conversion)
- [ ] The mapper is a pure function — easy to unit test
- [ ] Nullables: `null` in ApiModel → `null` in ViewModel (not `undefined`)
- [ ] ViewModel types **do not import** anything from `api-model` or the API
