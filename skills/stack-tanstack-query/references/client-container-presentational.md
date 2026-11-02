# client-container-presentational with TanStack Query

The concept skill `client-container-presentational` defines the rules. This file maps them to TanStack Query.

- Container data binding: `useQuery` / `useMutation` from TanStack Query.
- Component prohibition: ❌ `useQuery` / `useMutation` — it does not fetch data.
- With TanStack Query it is tempting to put `useQuery` directly in any component. The Container/Component pattern adds the explicit separation that the concept skill's docs explain.

## External Documentation

- [TanStack Query — Dependent Queries](https://tanstack.com/query/latest/docs/framework/react/guides/dependent-queries) — when a query depends on the result of another
