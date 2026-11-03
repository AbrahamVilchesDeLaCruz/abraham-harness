# client-pods — Patterns

## Example — minimal pod

```
pods/
└── profile/
    ├── api/
    │   ├── index.ts
    │   ├── profile.api-model.ts
    │   └── profile.api.ts
    ├── hooks.ts
    ├── ProfileContainer.{view}
    ├── ProfileComponent.{view}
    ├── profile.repository.ts
    ├── profile.mapper.ts
    ├── profile.types.ts
    └── index.ts
```

The flow of this pod: `ProfileContainer` -> `useProfile` in `hooks.ts` -> `profileRepository` -> `getProfile` in `api/profile.api.ts` -> HTTP request, and then render in `ProfileComponent`.
