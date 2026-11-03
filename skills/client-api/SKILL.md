---
name: client-api
description: "Trigger: When creating a pod's api/ layer, defining raw types, server-state hooks, or data mappers. api/ layer: api-model, api.ts; pod-root mapper and ViewModel types in apps/client/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

Use this skill when creating a pod's api/ layer, defining raw types, server-state hooks, or data mappers in `apps/client/`.

The data access layer of each pod. It has three responsibilities: raw types and server-state hooks in `api/` inside the pod, and data transformation in `{pod-name}.mapper.ts` at the pod root.

## Hard Rules

- `api-model.ts` reflects the server as is — untransformed
- `types.ts` reflects the UI as is — no server residue
- The mapper is the only layer that knows both worlds
- Mutation payloads go in `api-model.ts` (they are contracts with the server)
- Never use `any` in API types — if the type is not known, use `unknown` and validate it with a schema validator

## Decision Gates

| What you define | Where | Rule |
|---|---|---|
| Raw types of the server response | `{pod-name}.api-model.ts` | Represents **exactly** what the server returns. Snake_case if the server uses snake_case. |
| ViewModel types | `{pod-name}.types.ts` | Types **adapted to the UI**. camelCase always. Dates as `Date`, not strings. |
| Transformation | `{pod-name}.mapper.ts`, always at the pod root | Converts the raw API model to the ViewModel the UI uses. |
| Server-state hooks | `{pod-name}.api.ts` | See skill `client-query` for the full query and mutation pattern. |
| Layer barrel | `api/index.ts` | Re-exports everything public from the API layer |
| Root barrel | The pod's `index.ts` | Exports only the Container (the pod's entry point) |
| HTTP client | `core/api/apiClient.ts` | The HTTP client lives in `core/` and is imported from any pod |

## Execution Steps

1. Use the template in `assets/api-layer.template.md` when creating the api/ layer of a new pod (api-model, api.ts) and its pod-root mapper and types.
2. Choose the file for each piece with the Decision Gates table and copy its shape from `references/patterns.md`.
3. Check the Hard Rules before finishing.

## Output Contract

Leave this structure:

```
pods/{pod-name}/
└── api/
    ├── index.ts                    ← Barrel: re-exports hooks and types
    ├── {pod-name}.api-model.ts    ← Raw types of the server response
    └── {pod-name}.api.ts          ← Server-state hooks (queries / mutations)
```

Next to `api/`, at the pod root:

```
├── {pod-name}.mapper.ts           ← API response → ViewModel
└── {pod-name}.types.ts            ← ViewModel types (adapted to the UI)
```

## References

- [`references/patterns.md`](references/patterns.md) — examples of api-model, types, mapper, api.ts, barrels and the global API client.
- [`assets/api-layer.template.md`](assets/api-layer.template.md) — template for creating the api/ layer of a new pod.
- [`references/docs.md`](references/docs.md) — Read `references/docs.md` for the ApiModel/ViewModel rationale and external docs.
- Load the project's stack skill for server state (`stack-tanstack-query`) and read its `references/client-api.md`.
- Load the project's stack skill for views (`stack-react`) and read its `references/client-api.md` for the HTTP client and the schema validator.
- Load the project's stack skill for tests (`stack-vitest`) and read its `references/client-api.md`.
