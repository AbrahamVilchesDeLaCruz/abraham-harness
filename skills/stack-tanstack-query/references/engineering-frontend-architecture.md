# TanStack Query — frontend-architecture.md in engineering-conventions

TanStack Query details for the concepts in `frontend-architecture.md` in `engineering-conventions`.

## The pod's hooks

`api/` holds only the raw API model and the HTTP calls. The TanStack Query hooks live in the pod's hooks folder, and each one wraps a repository call.

```
hooks/
├── useCalendarEvents.ts  ← useQuery
├── useCreateEvent.ts     ← useMutation
└── index.ts              ← Barrel
```

| File | Responsibility |
|---|---|
| `hooks/useCalendarEvents.ts` | TanStack Query hook that calls the repository |

### `hooks/` — TanStack Query hooks

```ts
// hooks/useCalendarEvents.ts
import { useQuery } from "@tanstack/react-query";
import { calendarRepository } from "../calendar.repository";

export const useCalendarEvents = (params: { month: number; year: number }) => {
  return useQuery({
    queryKey: ["calendar", "events", params],
    queryFn: () => calendarRepository.getEvents(params),
  });
};
```

```ts
// hooks/useCreateEvent.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { calendarRepository } from "../calendar.repository";

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventPayload) => calendarRepository.createEvent(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calendar", "events"] }),
  });
};
```

## Data flow

```
Container → hooks (TanStack Query) → repository → API client → HTTP request
    ↓
Component → Sub-components
```
