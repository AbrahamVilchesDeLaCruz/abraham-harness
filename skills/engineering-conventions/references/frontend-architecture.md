# Frontend Architecture — Pods + Container-Presentational

> Client architecture of myapp (`apps/client/`).
> Framework code and details: read `references/engineering-frontend-architecture.md` in the stack skills that match this project's stack table.

---

## 1. What is the Pods architecture?

A **pod** is a self-contained functional unit that encapsulates all the logic, UI and data access of one concrete domain functionality.

**Data flow:** Container -> hooks -> repository -> API client -> HTTP request, and then render in the Component.

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
    ├── api/                              ← Raw API model and HTTP calls only
    │   ├── index.ts                      ← Barrel: re-exports everything
    │   ├── calendar.api-model.ts         ← Types of the raw API response
    │   └── calendar.api.ts               ← HTTP calls
    ├── hooks/                            ← Pod hooks, consumed by the Container
    │   ├── useCalendarEvents.ts
    │   ├── useCreateEvent.ts
    │   ├── useCalendarFilters.ts
    │   ├── useCalendarDates.ts
    │   └── index.ts                      ← Barrel: re-exports all hooks
    ├── components/                       ← Presentational sub-components
    │   ├── CalendarGrid
    │   ├── CalendarToolbar
    │   ├── CalendarFilterChips
    │   └── AppointmentTooltip
    ├── CalendarContainer                 ← Consumes the hooks, routing, context
    ├── CalendarComponent                 ← Renders what it receives + composition
    ├── calendar.repository.ts            ← Calls the API client, returns ViewModels
    ├── calendar.mapper.ts                ← API response → ViewModel
    ├── calendar.types.ts                 ← ViewModel types (adapted to the UI)
    ├── calendar.styles.ts                ← Styles specific to the pod
    └── index.ts                          ← Barrel: exports the Container
```

### Responsibilities of each file

| File                        | Responsibility                                          |
| --------------------------- | ------------------------------------------------------- |
| `CalendarContainer`         | Consumes the pod hooks + routing + global context       |
| `CalendarComponent`         | Renders what it receives + composition of sub-components |
| `api/calendar.api.ts`       | HTTP calls                                              |
| `api/calendar.api-model.ts` | Types of the raw API response                           |
| `api/index.ts`              | Barrel of the API layer                                 |
| `calendar.repository.ts`    | Calls the API client, returns ViewModels through the mapper |
| `calendar.mapper.ts`        | API response → ViewModel transformation                 |
| `calendar.types.ts`         | ViewModel types (adapted to the UI)                     |
| `calendar.styles.ts`        | Styles or classes specific to the pod                   |
| `hooks/`                    | Pod hooks: encapsulated state, and server state through the repository |
| `components/`               | Purely presentational sub-components                    |
| `index.ts`                  | Barrel that exports the Container (entry point of the pod) |

---

## 4. Container-Presentational pattern

The code of a Container and a Component lives in the stack reference.

### 4.1 Container

The container is the **entry door to the outside world**.

**Exclusive responsibilities:**

- Data binding: consumes the pod hooks, and passes data and callbacks to the Component
- Routing: current location, route params, navigation, search params
- Global context: context and client store
- Side effects toward the outside: mutations, navigation, redirects
- Derived URLs: derived values to build query parameters

**Prohibitions:**

- ❌ It does NOT call the repository, the API client or HTTP directly
- ❌ It does NOT have purely visual local state (no modals, no tooltips, no toggles)
- ❌ It does NOT have complex markup: it only renders the Component and passes it props
- ❌ It does NOT have lifecycle effects (except trivial sync toward the outside)
- ❌ It does NOT do data transformations (that is the mapper)

### 4.2 Component

The component **renders what it receives**: visual state, lifecycle, composition.

**Responsibilities:**

- Purely visual local state: for modals, tooltips, toggles
- Lifecycle: effects to synchronize UI state
- Imperative refs: for third-party components, scroll, etc.
- Composition: renders presentational sub-components

**Prohibitions:**

- ❌ It does NOT consume pod hooks: the Container does
- ❌ It does NOT fetch data
- ❌ It does NOT access routing
- ❌ It does NOT access global context directly

### 4.3 Visual contract

```
┌─────────────────────────────────────────────┐
│               Container                      │
│  (pod hooks, routing, client store)         │
│                                              │
│   ┌─────────────────────────────────────┐   │
│   │           Component                  │   │
│   │  (visual state, lifecycle, refs)    │   │
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
└── calendar.api.ts        ← HTTP calls
```

`api/` keeps only the raw API model and the HTTP calls. Server-state hooks live in the pod's hooks file or folder.

### `calendar.api-model.ts` — raw types

```ts
export interface CalendarEventApiModel {
  id: string;
  title: string;
  startDate: string; // ISO string — as it comes from the server
  endDate: string;
  createdAt: string;
}

export interface CreateEventPayload {
  title: string;
  startDate: string;
  endDate: string;
}
```

### `calendar.api.ts` — HTTP calls

```ts
import { apiClient } from "@/core/api/apiClient";
import { CalendarEventApiModel, CreateEventPayload } from "./calendar.api-model";

export const getCalendarEvents = async (params: { month: number; year: number }): Promise<CalendarEventApiModel[]> => {
  const { data } = await apiClient.get<CalendarEventApiModel[]>("/calendar/events", { params });
  return data;
};

export const createCalendarEvent = async (payload: CreateEventPayload): Promise<void> => {
  await apiClient.post("/calendar/events", payload);
};
```

### `calendar.repository.ts` — ViewModels through the mapper

It lives in the pod root, next to the mapper. It calls the API client and returns ViewModels through the mapper. The Component and the Container never call it directly.

```ts
import { createCalendarEvent, getCalendarEvents } from "./api/calendar.api";
import { CreateEventPayload } from "./api/calendar.api-model";
import { mapCalendarEvent } from "./calendar.mapper";
import { CalendarEventVM } from "./calendar.types";

export const calendarRepository = {
  getEvents: async (params: { month: number; year: number }): Promise<CalendarEventVM[]> => {
    const raw = await getCalendarEvents(params);
    return raw.map(mapCalendarEvent);
  },
  createEvent: (payload: CreateEventPayload): Promise<void> => createCalendarEvent(payload),
};
```

### `calendar.mapper.ts` — API response → ViewModel

```ts
import { CalendarEventApiModel } from "./api/calendar.api-model";
import { CalendarEventVM } from "./calendar.types";

export const mapCalendarEvent = (raw: CalendarEventApiModel): CalendarEventVM => ({
  id: raw.id,
  title: raw.title,
  startDate: new Date(raw.startDate),
  endDate: new Date(raw.endDate),
});
```

### `calendar.types.ts` — ViewModel

```ts
export interface CalendarEventVM {
  id: string;
  title: string;
  startDate: Date; // Date — adapted to the UI
  endDate: Date;
}
```

---

## 6. Pod hooks

Pod hooks are named functions in a separate `hooks` file or folder of the pod, called `use{Something}`. The Container consumes them.

A hook reaches the data through the repository: it calls `calendar.repository.ts`, never the API client or HTTP directly. A server-state hook wraps a repository call: one hook per query or mutation. A query declares its key and its fetch function. A mutation declares its function, and invalidates the affected query keys on success. The code lives in the stack reference.

### Naming

- Files: `camelCase.ts` → `useCalendarFilters.ts`
- Export: `camelCase` → `useCalendarFilters`
- Mandatory barrel for a `hooks/` folder: `hooks/index.ts` re-exports everything

### Return pattern: object with named fields

Every hook, pod or global, returns an object with named fields, also when it exposes state: `const { typeFilter, setTypeFilter } = useCalendarFilters();`. No tuples. The code lives in the stack reference.

### When to create a pod hook?

- When a group of state values + handlers are cohesive (filters, pagination)
- When the component has more than ~5 state values: a sign that there are hooks to extract, for the Container to consume
- When the logic can be named with a clear noun (`filters`, `dates`)

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
| HTTP calls       | `{pod-name}.api.ts`      | `calendar.api.ts`       |
| Repository (pod root) | `{pod-name}.repository.ts` | `calendar.repository.ts` |
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
Container → hooks → repository → API client → HTTP request
    ↓
Component → Sub-components
```
