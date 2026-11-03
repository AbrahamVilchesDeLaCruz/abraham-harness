# Frontend Architecture — Pods + Container-Presentational

> Client architecture of myapp (`apps/client/`).
> Framework code and details: read `references/engineering-frontend-architecture.md` in the stack skills that match this project's stack table.

---

## 1. What is the Pods architecture?

A **pod** is a self-contained functional unit that encapsulates all the logic, UI and data access of one concrete domain functionality.

**Goals:**

- **Encapsulation**: everything of a feature lives together
- **Scalability**: adding features does not dirty others
- **Maintainability**: a bug in `products` does not touch `reviews`
- **Low coupling**: a pod does NOT import from another pod

---

## 2. Global structure

```
apps/client/src/
├── common/        ← Reusable components with no domain (Button, Input, Modal)
├── common-app/    ← Reusable but tied to the domain (CreateProductPopup)
├── core/          ← Global configuration: router, auth, API client, interceptors
├── layout/        ← Visual templates (Sidebar, Topbar, AppShell)
├── pods/          ← Pods organized by domain
└── views/         ← Pages that select a layout + render pods
```

### Responsibilities

| Folder        | Responsibility                                                     |
| ------------- | ------------------------------------------------------------------ |
| `common/`     | Reusable components with no domain (buttons, inputs, modals)       |
| `common-app/` | Reusable but tied to the domain (shared business popups)           |
| `core/`       | Router, auth, API client, interceptors, global providers           |
| `layout/`     | Visual templates: Sidebar, Topbar, page shells                     |
| `pods/`       | Pods: each folder is a domain (`products/`, `reviews/`)            |
| `views/`      | Pages that compose layout + pods                                   |

---

## 3. Internal structure of a Pod

```
pods/
└── calendar/
    ├── api/                              ← Data access layer
    │   ├── index.ts                      ← Barrel: re-exports everything
    │   ├── calendar.api-model.ts         ← Types of the raw API response
    │   └── calendar.api.ts               ← Fetch functions (server-state library)
    ├── hooks/                            ← UI hooks of the pod
    │   ├── useCalendarFilters.ts
    │   ├── useCalendarTooltip.ts
    │   ├── useCalendarDates.ts
    │   └── index.ts                      ← Barrel: re-exports all hooks
    ├── components/                       ← Presentational sub-components
    │   ├── CalendarGrid
    │   ├── CalendarToolbar
    │   ├── CalendarFilterChips
    │   └── AppointmentTooltip
    ├── CalendarContainer                 ← Data binding (server state, routing, context)
    ├── CalendarComponent                 ← UI state + composition
    ├── calendar.mapper.ts                ← API response → ViewModel
    ├── calendar.types.ts                 ← ViewModel types (adapted to the UI)
    ├── calendar.styles.ts                ← Styles specific to the pod
    └── index.ts                          ← Barrel: exports the Container
```

### Responsibilities of each file

| File                        | Responsibility                                          |
| --------------------------- | ------------------------------------------------------- |
| `CalendarContainer`         | Data binding + routing + global context                 |
| `CalendarComponent`         | UI state + composition of sub-components                |
| `api/calendar.api.ts`       | Fetch functions with the server-state library           |
| `api/calendar.api-model.ts` | Types of the raw API response                           |
| `api/index.ts`              | Barrel of the API layer                                 |
| `calendar.mapper.ts`        | API response → ViewModel transformation                 |
| `calendar.types.ts`         | ViewModel types (adapted to the UI)                     |
| `calendar.styles.ts`        | Styles or classes specific to the pod                   |
| `hooks/`                    | Custom UI hooks of the pod (encapsulated state)         |
| `components/`               | Purely presentational sub-components                    |
| `index.ts`                  | Barrel that exports the Container (entry point of the pod) |

---

## 4. Container-Presentational pattern

The code of a Container and a Component lives in the stack reference.

### 4.1 Container

The container is the **entry door to the outside world**.

**Exclusive responsibilities:**

- Data binding: connection to the server-state library (queries and mutations)
- Routing: current location, route params, navigation, search params
- Global context: context and client store
- Side effects toward the outside: mutations, navigation, redirects
- Derived URLs: derived values to build query parameters

**Prohibitions:**

- ❌ It does NOT have UI state (no modals, no tooltips, no visual filters)
- ❌ It does NOT have complex markup: it only renders the Component and passes it props
- ❌ It does NOT have lifecycle effects (except trivial sync toward the outside)
- ❌ It does NOT do data transformations (that is the mapper)

### 4.2 Component

The component is the **owner of the UI**: visual state, lifecycle, composition.

**Responsibilities:**

- UI state: for modals, tooltips, filters, toggles
- Lifecycle: effects to synchronize UI state
- Imperative refs: for third-party components, scroll, etc.
- Composition: renders presentational sub-components
- Pod custom hooks: consumes hooks from `hooks/` that encapsulate UI logic

**Prohibitions:**

- ❌ It does NOT fetch data
- ❌ It does NOT access routing
- ❌ It does NOT access global context directly

### 4.3 Visual contract

```
┌─────────────────────────────────────────────┐
│               Container                      │
│  (routing, server state, client store)      │
│                                              │
│   ┌─────────────────────────────────────┐   │
│   │           Component                  │   │
│   │  (UI state, lifecycle, refs)        │   │
│   │                                      │   │
│   │  ┌──────────┐  ┌──────────────────┐ │   │
│   │  │ Toolbar  │  │  FilterChips     │ │   │
│   │  └──────────┘  └──────────────────┘ │   │
│   │  ┌──────────────────────────────────┐│   │
│   │  │           Grid                   ││   │
│   │  └──────────────────────────────────┘│   │
│   │  ┌──────────┐  ┌──────────────────┐ │   │
│   │  │ Tooltip  │  │     Popup        │ │   │
│   │  └──────────┘  └──────────────────┘ │   │
│   └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 5. The pod's API layer

Each pod has an `api/` folder with three files:

```
api/
├── index.ts               ← Barrel
├── calendar.api-model.ts  ← Raw API types (what the server returns)
└── calendar.api.ts        ← Server-state hooks (queries / mutations)
```

### `calendar.api-model.ts` — raw types

```ts
export interface CalendarEventApiModel {
  id: string;
  title: string;
  start_date: string; // ISO string — snake_case as it comes from the server
  end_date: string;
  created_at: string;
}
```

### `calendar.api.ts` — server-state hooks

One hook per query or mutation. A query declares its key and its fetch function. A mutation declares its function, and invalidates the affected query keys on success. The code lives in the stack reference.

### `calendar.mapper.ts` — API response → ViewModel

```ts
import { CalendarEventApiModel } from "./api/calendar.api-model";
import { CalendarEventVM } from "./calendar.types";

export const mapCalendarEvent = (raw: CalendarEventApiModel): CalendarEventVM => ({
  id: raw.id,
  title: raw.title,
  startDate: new Date(raw.start_date),
  endDate: new Date(raw.end_date),
});
```

### `calendar.types.ts` — ViewModel

```ts
export interface CalendarEventVM {
  id: string;
  title: string;
  startDate: Date; // camelCase — adapted to the UI
  endDate: Date;
}
```

---

## 6. Pod hooks

UI hooks are named functions in a separate `hooks` file or folder of the pod, called `use{Something}`.

### Naming

- Files: `camelCase.ts` → `useCalendarFilters.ts`
- Export: `camelCase` → `useCalendarFilters`
- Mandatory barrel for a `hooks/` folder: `hooks/index.ts` re-exports everything

### Return pattern: `[State, Handlers]` tuple

A pod hook that exposes state returns a tuple: the state first (`{ typeFilter, showCompleted }`), then the handlers that act on it (`{ setTypeFilter, toggleCompleted, resetFilters }`). A hook that only exposes functions may return named functions. The code lives in the stack reference.

### When to create a pod hook?

- When a group of state values + handlers are cohesive (filters, tooltips, pagination)
- When the component has more than ~5 state values: a sign that there are hooks to extract
- When the logic can be named with a clear noun (`filters`, `tooltip`, `dates`)

---

## 7. Global hooks

Hooks reusable across pods live in `src/core/hooks/` or `src/common/hooks/`. Example: `useClickOutside` (the code lives in the stack reference).

---

## 8. Naming conventions

| Element          | Convention               | Example                 |
| ---------------- | ------------------------ | ----------------------- |
| Container        | `PascalCase + Container` | `CalendarContainer`     |
| Component        | `PascalCase + Component` | `CalendarComponent`     |
| Sub-components   | `PascalCase`             | `CalendarGrid`          |
| Pod hooks        | `camelCase.ts`           | `useCalendarFilters.ts` |
| Global hooks     | `camelCase.ts`           | `useClickOutside.ts`    |
| API model        | `{pod-name}.api-model.ts` | `calendar.api-model.ts` |
| API hooks        | `{pod-name}.api.ts`      | `calendar.api.ts`       |
| Mapper (pod root) | `{pod-name}.mapper.ts`  | `calendar.mapper.ts`    |
| ViewModel types  | `{pod-name}.types.ts`    | `calendar.types.ts`     |
| Styles           | `{pod-name}.styles.ts`   | `calendar.styles.ts`    |
| Barrels          | `index.ts`               | `hooks/index.ts`        |

---

## 9. Key principles

**Isolation** — Each pod works independently. A bug in `products` does not touch `reviews`.

**Cohesion** — Everything related to a feature lives inside the pod.

**Low coupling** — A pod does NOT import from another pod. Communication only through `core`, `common`, or `common-app`.

**Do not over-architect** — If a pod has a single component with no hooks or sub-components, there is no need to create `hooks/` or `components/`. The structure grows with complexity.

---

## 10. Authenticated routes (`AppShell`)

| Route | Pod / view | Notes |
| ----- | ---------- | ----- |
| `/home` | `pods/home` | Post-login hub; cards per role |
| `/profile` | `pods/profile` | Account, preferences |
| `/stats` | `pods/stats` | User activity |
| `/orders` | `pods/orders` | Order history |
| `/backoffice/*` | backoffice | staff / admin |

Default post-login: `/home` (see `core/navigation/sessionNav.ts`).

---

## 11. Data flow

```
API → api.ts (server-state library) → mapper → ViewModel → Container → Component
                                                                ↑              ↓
                                                         mutations/callbacks  Sub-components
```
