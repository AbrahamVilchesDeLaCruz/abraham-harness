# client-hooks with TanStack Query

The concept skill `client-hooks` defines the rules. This file maps them to TanStack Query.

- A server-state hook wraps a repository call: `queryFn` and `mutationFn` call `{pod-name}.repository.ts`, never `apiClient` directly.
- The handlers hook consumes TanStack Query hooks: `mutateAsync` runs the mutation and `isPending` exposes its state.
- State hook checklist: no `useQuery` or `useMutation` in the state hook — only `useState`.
