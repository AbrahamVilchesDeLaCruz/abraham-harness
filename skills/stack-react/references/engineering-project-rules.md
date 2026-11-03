# React — project rules

Project rules from the `AGENTS.md` templates that name React or its client libraries.

- **Golden rule**: Container = outside world (pod hooks, routing, Zustand). Component = UI world (visual useState, useEffect, sub-components).
- **Pod flow**: Container -> hooks -> repository -> API client -> HTTP request, and then render in the Component.
- **Zustand** only for client state (not server cache).
- **Zod** to validate API responses in `core/`.
- `pnpm dev` starts the Vite dev server.

Internal structure of a pod with React file extensions:

```
pods/{pod-name}/
├── api/
│   ├── index.ts
│   ├── {pod-name}.api-model.ts
│   └── {pod-name}.api.ts
├── hooks/
│   ├── use{Something}.ts
│   └── index.ts
├── components/
│   └── {PodName}{Part}.tsx
├── {PodName}Container.tsx
├── {PodName}Component.tsx
├── {pod-name}.repository.ts
├── {pod-name}.mapper.ts
├── {pod-name}.types.ts
└── index.ts
```
