---
name: client-container-presentational
description: "Trigger: Al crear o modificar Containers y Components en pods, definir el contrato de props, o separar lógica de UI. Contrato Container/Component, responsabilidades, prohibiciones en apps/client/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

Usa esta skill al crear o modificar Containers y Components en pods, definir el contrato de props, o separar lógica de UI en `apps/client/`.

El patrón central del cliente. Cada pod tiene dos piezas obligatorias: **Container** y **Component**.

## Hard Rules

### Container (`*Container.tsx`)

La **puerta de entrada al mundo exterior** del pod.

Responsabilidades exclusivas:

- Data binding: `useQuery` / `useMutation` de TanStack Query
- Routing: `useParams`, `useLocation`, `useNavigate`, `useSearchParams`
- Contexto global: Zustand store, `useContext`
- Callbacks que disparan mutations o navegación
- `useMemo` para derivar parámetros de query (nunca `useState` para valores derivados)

Prohibiciones:

- ❌ `useState` de UI (modals, tooltips, filtros visuales)
- ❌ JSX complejo — solo renderiza `<{Feature}Component />` con props
- ❌ `useEffect` salvo sync trivial hacia afuera
- ❌ Transformaciones de datos (eso es el mapper)

### Component (`*Component.tsx`)

El **dueño de la UI**: estado visual, ciclo de vida, composición.

Responsabilidades:

- Estado de UI: `useState` para modals, tooltips, filtros, toggles
- `useEffect` para sincronizar estado de UI local
- `useRef` para componentes de terceros, scroll, focus
- Composición: renderiza sub-componentes de `components/`
- Consume hooks del pod (`hooks/`) para encapsular lógica de UI compleja

Prohibiciones:

- ❌ `useQuery` / `useMutation` — no hace fetch de datos
- ❌ `useParams`, `useNavigate`, `useLocation` — no accede a routing
- ❌ Zustand store ni `useContext` global
- ❌ Lógica de negocio — solo presentación y estado de UI

### Contrato de props

- Siempre declarar una interface explícita para las props del Component.
- El Component nunca sabe cómo se ejecuta una acción — solo recibe callbacks.

## Decision Gates

| Archivo | Líneas aprox. | Si lo supera |
|---|---|---|
| Container | ~40–80 líneas | Si el Container supera 80 líneas, probablemente tiene lógica de UI que no le corresponde. |
| Component | ~80–150 líneas | Si el Component supera 150 líneas, probablemente hay hooks del pod por extraer. |

## Execution Steps

1. Usa el template de `assets/container.template.md` al crear un Container + Component nuevo.
2. Reparte cada pieza según las Hard Rules; la forma de cada archivo, el contrato visual y el flujo de callbacks están en `references/patterns.md`.
3. Comprueba el tamaño de cada archivo con la tabla de Decision Gates.

## Output Contract

Un `*Container.tsx` que solo renderiza `<{Feature}Component />` con props y un `*Component.tsx` con su interface de props explícita, ambos dentro de los límites de las Hard Rules.

## References

- [`references/patterns.md`](references/patterns.md) — ejemplos de Container y Component, Props interface, contrato visual y flujo de callbacks.
- [`assets/container.template.md`](assets/container.template.md) — template al crear un Container + Component nuevo.
- [`references/docs.md`](references/docs.md) — Lee `references/docs.md` para el rationale del patrón y docs externos.
- Referencia completa: `docs/engineering/frontend-architecture.md`
