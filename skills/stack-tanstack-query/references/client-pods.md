# client-pods with TanStack Query

The concept skill `client-pods` defines the rules. This file maps them to TanStack Query.

- The pod's hooks file or folder holds its TanStack Query hooks. Each one wraps a call to `{pod-name}.repository.ts`.
- `api/{pod-name}.api.ts` holds only the HTTP calls.

## External Documentation

- [TanStack Query — Overview](https://tanstack.com/query/latest/docs/framework/react/overview) — base concepts of fetching
