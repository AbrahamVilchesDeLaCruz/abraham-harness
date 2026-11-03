# React — frontend-architecture.md in engineering-conventions

React details for the concepts in `frontend-architecture.md` in `engineering-conventions`.

## Internal structure of a pod

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
    │   ├── CalendarGrid.tsx
    │   ├── CalendarToolbar.tsx
    │   ├── CalendarFilterChips.tsx
    │   └── AppointmentTooltip.tsx
    ├── CalendarContainer.tsx             ← Consumes the hooks, routing, context
    ├── CalendarComponent.tsx             ← Renders what it receives + composition
    ├── calendar.repository.ts            ← Calls the API client, returns ViewModels
    ├── calendar.mapper.ts                ← API response → ViewModel
    ├── calendar.types.ts                 ← ViewModel types (adapted to the UI)
    ├── calendar.styles.ts                ← Styles specific to the pod
    └── index.ts                          ← Barrel: exports the Container
```

| File | Responsibility |
|---|---|
| `CalendarContainer.tsx` | Consumes the pod hooks + routing + global context |
| `CalendarComponent.tsx` | Renders what it receives + composition of sub-components |
| `calendar.types.ts` | TypeScript types of the ViewModel (adapted to the UI) |
| `calendar.styles.ts` | CSS-in-JS styles or classes specific to the pod |

## Container (`*Container.tsx`)

**Exclusive responsibilities:**

- Data binding: consumes the pod hooks, and passes data and callbacks to the Component
- Routing: `useLocation`, `useParams`, `useNavigate`, `searchParams`
- Global context: `useContext`, Zustand store
- Side effects toward the outside: mutations, navigation, redirects
- Derived URLs: `useMemo` to build query parameters

**Prohibitions:**

- ❌ It does NOT call the repository, `apiClient` or `fetch` directly
- ❌ It does NOT have `useState` for purely visual state (no modals, no tooltips, no toggles)
- ❌ It does NOT have complex JSX: it only renders `<CalendarComponent />` and passes it props
- ❌ It does NOT have `useEffect` (except trivial sync toward the outside)
- ❌ It does NOT do data transformations (that is the mapper)

```tsx
// ✅ CalendarContainer.tsx
export const CalendarContainer = () => {
  const { id } = useParams();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // Pod hooks — each one reaches the data through the repository
  const { data: events, isLoading } = useCalendarEvents({ month, year });
  const { mutate: createEvent } = useCreateEvent();
  const { typeFilter, showCompleted, setTypeFilter, resetFilters } = useCalendarFilters();

  return (
    <CalendarComponent
      events={events}
      isLoading={isLoading}
      typeFilter={typeFilter}
      showCompleted={showCompleted}
      onDateChange={(m, y) => {
        setMonth(m);
        setYear(y);
      }}
      onCreateEvent={createEvent}
      onFilter={setTypeFilter}
      onResetFilters={resetFilters}
    />
  );
};
```

## Component (`*Component.tsx`)

The component **renders what it receives**: visual state, React lifecycle, composition.

**Responsibilities:**

- Purely visual local state: `useState` for modals, tooltips, toggles
- Lifecycle: `useEffect` to synchronize UI state
- Imperative refs: `useRef` for third-party components, scroll, etc.
- Composition: renders presentational sub-components

**Prohibitions:**

- ❌ It does NOT consume pod hooks: the Container does
- ❌ It does NOT fetch data (no `useQuery`, no `fetch`)
- ❌ It does NOT access routing (`useLocation`, `useNavigate`)
- ❌ It does NOT access global context directly

```tsx
// ✅ CalendarComponent.tsx
interface CalendarComponentProps {
  events: CalendarEventVM[];
  isLoading: boolean;
  typeFilter: string | null;
  showCompleted: boolean;
  onDateChange: (month: number, year: number) => void;
  onCreateEvent: (data: CreateEventPayload) => void;
  onFilter: (typeFilter: string | null) => void;
  onResetFilters: () => void;
}

export const CalendarComponent = ({
  events,
  isLoading,
  typeFilter,
  showCompleted,
  onDateChange,
  onCreateEvent,
  onFilter,
  onResetFilters,
}: CalendarComponentProps) => {
  const calendarRef = useRef<FullCalendar>(null);
  // Purely visual state stays here: it is not a pod hook
  const [tooltip, setTooltip] = useState<CalendarTooltipVM | null>(null);

  return (
    <div>
      <CalendarToolbar typeFilter={typeFilter} onFilter={onFilter} />
      <CalendarFilterChips typeFilter={typeFilter} showCompleted={showCompleted} onReset={onResetFilters} />
      <CalendarGrid ref={calendarRef} events={events} isLoading={isLoading} onEventClick={setTooltip} />
      {tooltip && <AppointmentTooltip {...tooltip} onClose={() => setTooltip(null)} />}
    </div>
  );
};
```

## Visual contract

```
┌─────────────────────────────────────────────┐
│               Container                      │
│  (pod hooks, routing, Zustand)              │
│                                              │
│   ┌─────────────────────────────────────┐   │
│   │           Component                  │   │
│   │  (visual useState, useEffect, refs) │   │
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

## Pod hooks

### Return pattern: object with named fields

Every hook, pod or global, returns an object with named fields, also when it exposes state. No tuples.

```ts
export function useCalendarFilters() {
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const resetFilters = () => {
    setTypeFilter(null);
    setShowCompleted(false);
  };

  return {
    typeFilter,
    showCompleted,
    setTypeFilter,
    toggleCompleted: () => setShowCompleted((v) => !v),
    resetFilters,
  };
}
```

### When to create a pod hook

- When a group of `useState` + handlers are cohesive (filters, pagination)
- When the component has more than ~5 `useState`: a sign that there are hooks to extract, for the Container to consume

## Global hooks

```ts
// useClickOutside.ts
export const useClickOutside = (ref: RefObject<HTMLElement>, handler: () => void) => {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
};
```

## Naming conventions

| Element | Convention | Example |
|---|---|---|
| Container | `PascalCase + Container.tsx` | `CalendarContainer.tsx` |
| Component | `PascalCase + Component.tsx` | `CalendarComponent.tsx` |
| Sub-components | `PascalCase.tsx` | `CalendarGrid.tsx` |
