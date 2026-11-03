# Client Agent — {{PROJECT_NAME}}

> **Scope**: All the code in `apps/client/`. For other scopes, go back to the orchestrator: [../../AGENTS.md](../../AGENTS.md)

---

<!-- abraham-harness:auto-invoke:start -->
## Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action | Skill |
|---|---|
| Create a new pod or add files to an existing one | `client-pods` |
| Create or modify a Container or Component | `client-container-presentational` |
| Add queries, mutations or query keys | `client-query` |
| Create or modify `api/`, repository, mapper, or types | `client-api` |
| Create or modify pod or global hooks | `client-hooks` |
| Write tests (unit, integration, E2E) | `client-testing` |

After a concept skill, load the stack skill that matches this project's stack table, and read its `references/{concept-skill}.md`.
<!-- abraham-harness:auto-invoke:end -->

---

## Architecture

Pods + Container-Presentational pattern.

> Complete reference: `frontend-architecture.md` in `engineering-conventions`

```
apps/client/src/
├── common/        ← Reusable components with no domain (Button, Input, Modal)
├── common-app/    ← Reusable but tied to the domain (CreateProductPopup)
├── core/          ← Router, auth, API client, interceptors, global providers
├── layout/        ← Visual templates (Sidebar, Topbar, AppShell)
├── pods/          ← Pods organized by domain
└── views/         ← Pages that select a layout + render pods
```

### Internal structure of a pod

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
│   └── {PodName}{Part}
├── {PodName}Container
├── {PodName}Component
├── {pod-name}.repository.ts
├── {pod-name}.mapper.ts
├── {pod-name}.types.ts
└── index.ts
```

**Data flow**: Container -> hooks -> repository -> API client -> HTTP request, and then render in the Component.

**Golden rule**: Container = outside world (pod hooks, routing, client store). Component = UI world (purely visual local state, lifecycle effects, sub-components).

---

## Stack table

Fill in this list with this project's stack. The values shown are the default suggestion.

- Main UI: React + TypeScript (`stack-react`)
- Bundler and dev server: Vite (`stack-react`)
- Utility styles: TailwindCSS
- Server state and cache: TanStack Query (`stack-tanstack-query`)
- Client state (UI, session): Zustand (`stack-react`)
- Unit and integration testing: Vitest + RTL (`stack-vitest`)
- E2E testing: Playwright (`stack-vitest`)
- API mocking in tests: MSW (`stack-vitest`)

---

## Code Rules

- Strict **TypeScript**: do not use `any`
- The **server-state library** for everything that comes from the server: never hand-written local state plus effects for fetching
- The **client store** only for client state (not server cache)
- A **schema validator** to validate API responses in `core/`
- Path aliases in all imports
- A pod does NOT import from another pod

---

## Commands

```bash
# From apps/client/
pnpm dev              # Dev server
pnpm lint             # ESLint --fix

# ─── Unit tests ───────────────────────────────────────────────────────────────
pnpm test             # Test runner, single pass (passes if there are no tests yet)
pnpm test:watch       # TDD loop — re-run on change
pnpm test:cov         # Tests + coverage → coverage/
pnpm test:ui          # Test runner UI in the browser (interactive visualization)

# ─── E2E tests ────────────────────────────────────────────────────────────────
pnpm test:e2e         # E2E runner (requires prior installation)
pnpm test:e2e:ui      # E2E runner with interactive UI

# ─── All ──────────────────────────────────────────────────────────────────────
pnpm test:all         # Unit + E2E sequentially

# ─── CI ───────────────────────────────────────────────────────────────────────
pnpm test:ci          # Tests + coverage + verbose (GitHub Actions)
pnpm test:e2e:ci      # E2E with the GitHub reporter (GitHub Actions)
```

**Test runner config:** separate from the bundler config intentionally.
**Setup:** `src/test/setup.ts`.
**Coverage thresholds:** 75% branches / 78% functions / 80% lines / 80% statements

---

<!-- abraham-harness:available-skills:start -->
## Available Skills

| Skill | Description |
|---|---|
| `client-pods` | Pod structure, naming, when to create what |
| `client-container-presentational` | Container/Component contract, responsibilities, prohibitions |
| `client-query` | Server state: queries, mutations, query keys, invalidation |
| `client-api` | api/ layer: api-model, api.ts; pod-root repository, mapper and ViewModel types |
| `client-hooks` | Pod hooks with named fields, global hooks, when to extract |
| `client-testing` | Unit/integration tests, E2E, API mocks |
| `stack-react` | Maps the concept skills to React |
| `stack-tanstack-query` | Maps the concept skills to TanStack Query |
| `stack-vitest` | Maps the concept skills to Vitest, Testing Library, MSW and Playwright |
<!-- abraham-harness:available-skills:end -->

---

## Project Skills

Skills that exist only in this project. `skill-sync` keeps this table current. `update` refreshes the tables between the `abraham-harness` markers, and never changes this one.

| Skill | Trigger | Description |
| --- | --- | --- |
