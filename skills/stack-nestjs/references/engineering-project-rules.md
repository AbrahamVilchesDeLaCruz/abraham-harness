# NestJS — project rules

Project rules from the `AGENTS.md` templates that name NestJS or its libraries.

- `infrastructure/framework/` holds NestJS modules + exception registries.
- `shared/` inside a BC is only for what crosses modules; the NestJS module of the whole BC goes in `shared/infrastructure/framework/`.
- `api-infrastructure` covers NestJS modules.
- `api-validation` covers configuring ValidationPipe, Payload and Query with class-validator: global ValidationPipe, Payload/Query with class-validator.
- `api-shared` covers the global SharedModule and env validation with Joi.
- `pnpm start:dev` starts the dev server with hot-reload.
- **Zod and Class Validator** for client-server validation.
- Class Validator validates HTTP payloads in controllers.
