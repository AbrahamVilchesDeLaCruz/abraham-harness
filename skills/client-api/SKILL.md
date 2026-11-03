---
name: client-api
description: "Trigger: When creating a pod's api/ layer or repository, defining raw types, HTTP calls, or data mappers. api/ layer: api-model, api.ts; pod-root repository, mapper and ViewModel types in apps/client/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

Use this skill when creating a pod's api/ layer or repository, defining raw types, HTTP calls, or data mappers in `apps/client/`.

The data access of each pod: raw types and HTTP calls in `api/` inside the pod, and `{pod-name}.repository.ts` and `{pod-name}.mapper.ts` at the pod root. The flow is: Container -> hooks -> repository -> API client -> HTTP request.

## Hard Rules

- `api/` holds only the raw API model and the HTTP calls — no hooks and no ViewModels
- The repository calls the API client and returns ViewModels through the mapper
- Only hooks call the repository. The Component and the Container never call it directly
- `api-model.ts` reflects the server as is — untransformed
- `types.ts` reflects the UI as is — no server residue
- The mapper is the only layer that knows both worlds
- Mutation payloads go in `api-model.ts` (they are contracts with the server)
- Never use `any` in API types — if the type is not known, use `unknown` and validate it with a schema validator

## Decision Gates

| What you define | Where | Rule |
|---|---|---|
| Raw types of the server response | `{pod-name}.api-model.ts` | Represents **exactly** what the server returns: camelCase fields, dates as strings. |
| ViewModel types | `{pod-name}.types.ts` | Types **adapted to the UI**. camelCase always. Dates as `Date`, not strings. |
| Transformation | `{pod-name}.mapper.ts`, always at the pod root | Converts the raw API model to the ViewModel the UI uses. |
| HTTP calls | `{pod-name}.api.ts` | One function per endpoint. It calls the HTTP client and returns the raw API model. |
| Repository | `{pod-name}.repository.ts`, always at the pod root, next to the mapper | Calls the HTTP calls of `api/` and returns ViewModels through the mapper. |
| Server-state hooks | The pod's hooks file or folder | They wrap a repository call. See skill `client-query` for the full query and mutation pattern. |
| Layer barrel | `api/index.ts` | Re-exports everything public from the API layer |
| Root barrel | The pod's `index.ts` | Exports only the Container (the pod's entry point) |
| HTTP client | `core/api/apiClient.ts` | The HTTP client lives in `core/`. A pod imports it only from `{pod-name}.api.ts` |

## Execution Steps

1. Use the template in `assets/api-layer.template.md` when creating the api/ layer of a new pod (api-model, api.ts) and its pod-root repository, mapper and types.
2. Choose the file for each piece with the Decision Gates table and copy its shape from `references/patterns.md`.
3. Check the Hard Rules before finishing.

## Output Contract

Leave this structure:

```
pods/{pod-name}/
└── api/
    ├── index.ts                    ← Barrel: re-exports HTTP calls and types
    ├── {pod-name}.api-model.ts    ← Raw types of the server response
    └── {pod-name}.api.ts          ← HTTP calls
```

Next to `api/`, at the pod root:

```
├── {pod-name}.repository.ts       ← Calls the API client, returns ViewModels
├── {pod-name}.mapper.ts           ← API response → ViewModel
└── {pod-name}.types.ts            ← ViewModel types (adapted to the UI)
```

## References

- [`references/patterns.md`](references/patterns.md) — examples of api-model, types, mapper, api.ts, repository, barrels and the global API client.
- [`assets/api-layer.template.md`](assets/api-layer.template.md) — template for creating the api/ layer of a new pod.
- [`references/docs.md`](references/docs.md) — Read `references/docs.md` for the ApiModel/ViewModel rationale and external docs.
- Load the project's stack skill for server state (`stack-tanstack-query`) and read its `references/client-api.md`.
- Load the project's stack skill for views (`stack-react`) and read its `references/client-api.md` for the HTTP client and the schema validator.
- Load the project's stack skill for tests (`stack-vitest`) and read its `references/client-api.md`.
