# NestJS — backend-architecture.md in engineering-conventions

NestJS details for the concepts in `backend-architecture.md` in `engineering-conventions`.

- **Dependency Injection**: the Composition Root of the backend is the NestJS module.
- `{module}.module.ts` under `{bc}/{module}/infrastructure/framework/` is the NestJS module of a submodule. `{bc}-shared.module.ts` under `{bc}/shared/infrastructure/framework/` is the shared NestJS module of the Bounded Context, the one `SharedModule` imports.
