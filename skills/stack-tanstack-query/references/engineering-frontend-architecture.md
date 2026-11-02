# TanStack Query — docs/engineering/frontend-architecture.md

TanStack Query details for the concepts in `docs/engineering/frontend-architecture.md`.

## The pod's API layer

```
api/
├── index.ts               ← Barrel
├── calendar.api-model.ts  ← Raw API types (what the server returns)
└── calendar.api.ts        ← TanStack Query hooks (useQuery / useMutation)
```

| File | Responsibility |
|---|---|
| `api/calendar.api.ts` | Fetch functions with TanStack Query |

### `calendar.api.ts` — TanStack Query hooks

```ts
export const useCalendarEvents = (params: { month: number; year: number }) => {
  return useQuery({
    queryKey: ["calendar", "events", params],
    queryFn: () => apiClient.get<CalendarEventApiModel[]>("/calendar/events", { params }),
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventPayload) => apiClient.post("/calendar/events", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calendar", "events"] }),
  });
};
```

## Data flow

```
API → api.ts (TanStack Query) → mapper → ViewModel → Container → Component
                                                          ↑              ↓
                                                   mutations/callbacks  Sub-components
```
