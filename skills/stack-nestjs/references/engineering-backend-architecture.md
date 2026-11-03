# NestJS — docs/engineering/backend-architecture.md

NestJS details for the concepts in `docs/engineering/backend-architecture.md`.

- **Dependency Injection**: the Composition Root of the backend is the NestJS module.
- `{module}.module.ts` under `{bc}/{module}/infrastructure/framework/` is the NestJS module of a submodule. `{bc}-shared.module.ts` under `{bc}/shared/infrastructure/framework/` is the shared NestJS module of the Bounded Context, the one `SharedModule` imports.
