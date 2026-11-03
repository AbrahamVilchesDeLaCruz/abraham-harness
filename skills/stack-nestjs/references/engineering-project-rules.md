# NestJS — project rules

Project rules from the `AGENTS.md` templates that name NestJS or its libraries.

- `infrastructure/framework/` holds NestJS modules + exception registries.
- `shared/` inside a BC is only for what crosses modules; the BC's shared NestJS module goes in `shared/infrastructure/framework/`. Each submodule keeps its NestJS module and exception registry in `{bc}/{module}/infrastructure/framework/`.
- `SharedModule` imports only the BCs' shared NestJS modules, never a submodule directly.
- `api-infrastructure` covers NestJS modules.
- `api-validation` covers configuring ValidationPipe, Payload and Query with class-validator: global ValidationPipe, Payload/Query with class-validator.
- `api-shared` covers the global SharedModule and env validation with Joi.
- `pnpm start:dev` starts the dev server with hot-reload.
- **Zod and Class Validator** for client-server validation.
- Class Validator validates HTTP payloads in controllers.

For `no-console` warnings in code that goes to production, the logger port the conventions name is the NestJS logger (`Logger`).
