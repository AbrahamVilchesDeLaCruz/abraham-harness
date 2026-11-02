# React — docs/engineering/engineering-principles.md

React details for the concepts in `docs/engineering/engineering-principles.md`.

## Dependency Inversion

The Container depends on hooks (`useProducts`, `useCreateProduct`), not on `axios` or `fetch` directly.

## Composition Root

In the frontend, the `QueryClient`, the Zustand providers and the context wrappers are the Composition Root. Components never instantiate services directly.
