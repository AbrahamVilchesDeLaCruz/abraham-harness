# TanStack Query — docs/engineering/engineering-principles.md

TanStack Query details for the concepts in `docs/engineering/engineering-principles.md`.

## Separation of Concerns

| Concern | Where it lives |
|---|---|
| Server state and cache | TanStack Query / api hooks (frontend) |

## Composition Root

The `QueryClient` is part of the frontend Composition Root.
