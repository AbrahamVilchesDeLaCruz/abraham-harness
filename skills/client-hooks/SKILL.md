---
name: client-hooks
description: "Trigger: Al crear hooks de estado o handlers en un pod, extraer lógica a hooks globales, o decidir cuándo crear un hook. Hooks del pod [State, Handlers], hooks globales, cuándo extraer en apps/client/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

Usa esta skill al crear hooks de estado o handlers en un pod, extraer lógica a hooks globales, o decidir cuándo crear un hook.

Hooks del pod y hooks globales en `apps/client/`.

## Hard Rules

- Un hook del pod **no se importa desde otro pod** — si se necesita en dos pods, muévelo a `core/hooks/`
- Los hooks del pod pueden usar hooks globales
- Los hooks del pod **no hacen fetch** — eso es responsabilidad de `api.ts`
- Un hook global **no tiene lógica de dominio** — si la tiene, es un hook del pod
- Los hooks del pod retornan siempre una tupla para desestructurar limpiamente en el Component: `[State, Handlers]`
- Naming: archivo `camelCase.ts` → `useProductFilters.ts`; export `camelCase` → `useProductFilters`
- Barrel obligatorio: `hooks/index.ts` re-exporta todo

## Decision Gates

| Tipo | Ubicación | Alcance |
|---|---|---|
| Hooks del pod | `containers/{feature}/hooks/` | Solo dentro del pod |
| Hooks globales | `core/hooks/` o `common/hooks/` | Reutilizables entre pods |

Crea un hook del pod:

- Cuando hay un grupo de `useState` + handlers cohesionados (filtros, tooltips, paginación, selección)
- Cuando el Component tiene más de ~5 `useState` → señal de que hay hooks por extraer
- Cuando la lógica se puede nombrar con un sustantivo claro: `filters`, `tooltip`, `pagination`

## Execution Steps

1. Decide tipo y ubicación con la tabla de Decision Gates.
2. Usa el template de `assets/use-state-handlers.template.md` al extraer `use{Pod}State` y `use{Pod}Handlers`.
3. Sigue la forma de `references/patterns.md`: tupla, uso en el Component, barrel y hooks globales de ejemplo.
4. Añade el hook del pod al barrel `hooks/index.ts`.

## Output Contract

Un hook del pod que retorna la tupla `[State, Handlers]` y está re-exportado en `hooks/index.ts`, o un hook global sin lógica de dominio en su ubicación global.

## References

- [`references/patterns.md`](references/patterns.md) — patrón de retorno, uso en el Component, barrel del pod y hooks globales.
- [`assets/use-state-handlers.template.md`](assets/use-state-handlers.template.md) — template al extraer `use{Pod}State` y `use{Pod}Handlers`.
- [`references/docs.md`](references/docs.md) — Lee `references/docs.md` para el rationale del patrón tupla y docs externos.
