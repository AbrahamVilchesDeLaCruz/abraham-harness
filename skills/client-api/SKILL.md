---
name: client-api
description: "Trigger: Al crear la capa api/ de un pod, definir tipos crudos, hooks TanStack Query, o mappers de datos. Capa api/: api-model, api.ts, mapper, ViewModel types en apps/client/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

Usa esta skill al crear la capa api/ de un pod, definir tipos crudos, hooks TanStack Query, o mappers de datos en `apps/client/`.

Capa de acceso a datos de cada pod. Vive en `api/` dentro del pod y tiene tres responsabilidades: tipos crudos, hooks TanStack Query, y transformación de datos.

## Hard Rules

- `api-model.ts` refleja el servidor tal cual — sin transformar
- `types.ts` refleja la UI tal cual — sin residuos del servidor
- El mapper es la única capa que conoce ambos mundos
- Los payloads de mutations van en `api-model.ts` (son contratos con el servidor)
- Nunca usar `any` en tipos de API — si no se sabe el tipo, usar `unknown` y validar con Zod

## Decision Gates

| Qué defines | Dónde | Regla |
|---|---|---|
| Tipos crudos de la respuesta del servidor | `{feature}.api-model.ts` | Representa **exactamente** lo que devuelve el servidor. Snake_case si el servidor usa snake_case. |
| Tipos del ViewModel | `{feature}.types.ts` | Tipos **adaptados a la UI**. camelCase siempre. Fechas como `Date`, no strings. |
| Transformación | `{feature}.mapper.ts` | Convierte el modelo crudo de la API al ViewModel que usa la UI. |
| Hooks TanStack Query | `{feature}.api.ts` | Ver skill `client-query` para el patrón completo de queries y mutations. |
| Barrel de la capa | `api/index.ts` | Re-exporta todo lo público de la capa API |
| Barrel raíz | `index.ts` del pod | Solo exporta el Container (punto de entrada del pod) |
| Cliente HTTP | `core/api/apiClient.ts` | El cliente HTTP vive en `core/` y se importa desde cualquier pod |

## Execution Steps

1. Usa el template de `assets/api-layer.template.md` al crear la capa api/ de un nuevo pod (api-model, mapper, types).
2. Elige el archivo de cada pieza con la tabla de Decision Gates y copia su forma de `references/patterns.md`.
3. Comprueba las Hard Rules antes de terminar.

## Output Contract

Deja esta estructura:

```
containers/{feature}/
└── api/
    ├── index.ts                    ← Barrel: re-exporta hooks y types
    ├── {feature}.api-model.ts     ← Tipos crudos de la respuesta del servidor
    └── {feature}.api.ts           ← Hooks TanStack Query (useQuery / useMutation)
```

Junto a `api/`, en la raíz del pod:

```
├── {feature}.mapper.ts            ← API response → ViewModel
└── {feature}.types.ts             ← Tipos del ViewModel (adaptados a la UI)
```

## References

- [`references/patterns.md`](references/patterns.md) — ejemplos de api-model, types, mapper, api.ts, barrels y API client global.
- [`assets/api-layer.template.md`](assets/api-layer.template.md) — template al crear la capa api/ de un nuevo pod.
- [`references/docs.md`](references/docs.md) — Lee `references/docs.md` para el rationale ApiModel/ViewModel y docs externos.
