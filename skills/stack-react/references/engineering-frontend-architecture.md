# React — docs/engineering/frontend-architecture.md

React details for the concepts in `docs/engineering/frontend-architecture.md`.

## Internal structure of a pod

```
pods/
└── calendar/
    ├── api/                              ← Data access layer
    │   ├── index.ts                      ← Barrel: re-exports everything
    │   ├── calendar.api-model.ts         ← Types of the raw API response
    │   └── calendar.api.ts               ← Fetch functions (TanStack Query)
    ├── hooks/                            ← UI hooks of the pod
    │   ├── useCalendarFilters.ts
    │   ├── useCalendarTooltip.ts
    │   ├── useCalendarDates.ts
    │   └── index.ts                      ← Barrel: re-exports all hooks
    ├── components/                       ← Presentational sub-components
    │   ├── CalendarGrid.tsx
    │   ├── CalendarToolbar.tsx
    │   ├── CalendarFilterChips.tsx
    │   └── AppointmentTooltip.tsx
    ├── CalendarContainer.tsx             ← Data binding (TanStack Query, routing, context)
    ├── CalendarComponent.tsx             ← UI state + composition
    ├── calendar.mapper.ts                ← API response → ViewModel
    ├── calendar.types.ts                 ← ViewModel types (adapted to the UI)
    ├── calendar.styles.ts                ← Styles specific to the pod
    └── index.ts                          ← Barrel: exports the Container
```

| File | Responsibility |
|---|---|
| `CalendarContainer.tsx` | Data binding + routing + global context |
| `CalendarComponent.tsx` | UI state + composition of sub-components |
| `calendar.types.ts` | TypeScript types of the ViewModel (adapted to the UI) |
| `calendar.styles.ts` | CSS-in-JS styles or classes specific to the pod |

## Container (`*Container.tsx`)

**Exclusive responsibilities:**

- Data binding: connection to TanStack Query (queries and mutations)
- Routing: `useLocation`, `useParams`, `useNavigate`, `searchParams`
- Global context: `useContext`, Zustand store
- Side effects toward the outside: mutations, navigation, redirects
- Derived URLs: `useMemo` to build query parameters

**Prohibitions:**

- ❌ It does NOT have UI `useState` (no modals, no tooltips, no visual filters)
- ❌ It does NOT have complex JSX: it only renders `<CalendarComponent />` and passes it props
- ❌ It does NOT have `useEffect` (except trivial sync toward the outside)
- ❌ It does NOT do data transformations (that is the mapper)

```tsx
// ✅ CalendarContainer.tsx
export const CalendarContainer = () => {
  const { id } = useParams();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // TanStack Query
  const { data: events, isLoading } = useCalendarEvents({ month, year });
  const { mutate: createEvent } = useCreateEvent();

  return (
    <CalendarComponent
      events={events}
      isLoading={isLoading}
      onDateChange={(m, y) => {
        setMonth(m);
        setYear(y);
      }}
      onCreateEvent={createEvent}
    />
  );
};
```

## Component (`*Component.tsx`)

The component is the **owner of the UI**: visual state, React lifecycle, composition.

**Responsibilities:**

- UI state: `useState` for modals, tooltips, filters, toggles
- Lifecycle: `useEffect` to synchronize UI state
- Imperative refs: `useRef` for third-party components, scroll, etc.
- Composition: renders presentational sub-components
- Pod custom hooks: consumes hooks from `hooks/` that encapsulate UI logic

**Prohibitions:**

- ❌ It does NOT fetch data (no `useQuery`, no `fetch`)
- ❌ It does NOT access routing (`useLocation`, `useNavigate`)
- ❌ It does NOT access global context directly

```tsx
// ✅ CalendarComponent.tsx
interface CalendarComponentProps {
  events: CalendarEventVM[];
  isLoading: boolean;
  onDateChange: (month: number, year: number) => void;
  onCreateEvent: (data: CreateEventPayload) => void;
}

export const CalendarComponent = ({
  events,
  isLoading,
  onDateChange,
  onCreateEvent,
}: CalendarComponentProps) => {
  const calendarRef = useRef<FullCalendar>(null);
  const { typeFilter, showCompleted, setTypeFilter, resetFilters } = useCalendarFilters();
  const { tooltip, closeTooltip } = useCalendarTooltip();

  return (
    <div>
      <CalendarToolbar typeFilter={typeFilter} onFilter={setTypeFilter} />
      <CalendarFilterChips typeFilter={typeFilter} showCompleted={showCompleted} onReset={resetFilters} />
      <CalendarGrid ref={calendarRef} events={events} isLoading={isLoading} />
      {tooltip.visible && <AppointmentTooltip {...tooltip} onClose={closeTooltip} />}
    </div>
  );
};
```

## Visual contract

```
┌─────────────────────────────────────────────┐
│               Container                      │
│  (routing, TanStack Query, Zustand)         │
│                                              │
│   ┌─────────────────────────────────────┐   │
│   │           Component                  │   │
│   │  (useState UI, useEffect, refs)     │   │
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

Every pod hook returns an object with named fields, also when it exposes state. No tuples.

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

- When a group of `useState` + handlers are cohesive (filters, tooltips, pagination)
- When the component has more than ~5 `useState`: a sign that there are hooks to extract

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
