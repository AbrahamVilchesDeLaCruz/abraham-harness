# React — project rules

Project rules from the `AGENTS.md` templates that name React or its client libraries.

- **Golden rule**: Container = outside world (queries, routing, Zustand). Component = UI world (useState, useEffect, sub-components).
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
├── {pod-name}.mapper.ts
├── {pod-name}.types.ts
└── index.ts
```
