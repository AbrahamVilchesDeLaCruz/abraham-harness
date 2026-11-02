# React — project rules

Project rules from the `AGENTS.md` templates that name React or its client libraries.

- **Golden rule**: Container = outside world (queries, routing, Zustand). Component = UI world (useState, useEffect, sub-components).
- **Zustand** only for client state (not server cache).
- **Zod** to validate API responses in `core/`.
- `pnpm dev` starts the Vite dev server.

Internal structure of a pod with React file extensions:

```
containers/{feature}/
├── api/
│   ├── index.ts
│   ├── {feature}.api-model.ts
│   └── {feature}.api.ts
├── hooks/
│   ├── use{Feature}{Concern}.ts
│   └── index.ts
├── components/
│   └── {Feature}{Part}.tsx
├── {Feature}Container.tsx
├── {Feature}Component.tsx
├── {feature}.mapper.ts
├── {feature}.types.ts
└── index.ts
```
