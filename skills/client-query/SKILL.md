---
name: client-query
description: "Trigger: Al usar useQuery, useMutation, definir query keys, o invalidar queries tras una mutation. TanStack Query: queries, mutations, query keys, invalidación en apps/client/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

Usa esta skill al usar useQuery, useMutation, definir query keys, o invalidar queries tras una mutation.

Cómo usar TanStack Query en `apps/client/`. Las queries y mutations viven en `api/{feature}.api.ts` dentro de cada pod.

## Hard Rules

- **`useQuery`** → en el Container (data fetching)
- **`useMutation`** → en el Container (side effects)
- El Component **nunca** llama a queries ni mutations directamente
- Las query keys son arrays. Deben ser **consistentes** dentro del pod. Patrón: `[dominio, recurso, params]`
- Exportar las keys como constantes para reutilizarlas en invalidaciones
- Usar los estados de TanStack Query directamente — no duplicar en `useState`
- Configurar el staleTime por defecto en el `QueryClient` global (`core/`)

## Decision Gates

Invalidación:

| Cuándo | Qué invalidar |
|---|---|
| Crear un item | `invalidateQueries(keys.lists())` |
| Eliminar un item | `invalidateQueries(keys.lists())` + `removeQueries(keys.detail(id))` |
| Actualizar un item | `setQueryData(keys.detail(id), updated)` + `invalidateQueries(keys.lists())` |
| Acción que afecta múltiples recursos | `invalidateQueries({ queryKey: ['products'] })` — invalida todo el dominio |

staleTime: sobreescribir por query solo cuando sea necesario:

| Datos | Valor |
|---|---|
| Datos muy dinámicos | `staleTime: 0` |
| Datos estáticos | `staleTime: Infinity` |

## Execution Steps

1. Usa el template de `assets/query-hook.template.md` al crear queries, mutations y query keys para un nuevo pod.
2. Define keys, queries y mutations en `api/{feature}.api.ts` siguiendo `references/patterns.md`.
3. Consúmelas desde el Container y pasa datos y callbacks al Component.
4. Elige la invalidación de cada mutation con la tabla de Decision Gates.

## Output Contract

Hooks de query y mutation en `api/{feature}.api.ts`, con keys exportadas e invalidación según la tabla, consumidos solo desde el Container.

## References

- [`references/patterns.md`](references/patterns.md) — query keys, useQuery, useMutation, uso en el Container, estados de UI y staleTime por defecto.
- [`assets/query-hook.template.md`](assets/query-hook.template.md) — template al crear queries, mutations y query keys para un nuevo pod.
- [`references/docs.md`](references/docs.md) — Lee `references/docs.md` para TanStack Query docs y la estrategia de query keys del proyecto.
