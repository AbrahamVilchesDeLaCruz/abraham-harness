# TanStack Query — engineering-principles.md in engineering-conventions

TanStack Query details for the concepts in `engineering-principles.md` in `engineering-conventions`.

## Separation of Concerns

| Concern | Where it lives |
|---|---|
| Server state and cache | TanStack Query / pod hooks (frontend) |

## Composition Root

The `QueryClient` is part of the frontend Composition Root.
