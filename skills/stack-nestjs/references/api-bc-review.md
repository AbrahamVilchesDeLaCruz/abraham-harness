# api-bc-review with NestJS

Apply the process of `api-bc-review`. These are the NestJS forms of its checks.

## Audit checklist

- Phase 2: No `@Injectable()`, `@Column()`, or framework imports in `domain/`.
- Phase 3: All ports injected by token — `@Inject(TOKEN)` pattern.
- Phase 3: Domain services are stateless (or managed by NestJS with `@Injectable()`).
- Phase 4: Controllers have Swagger decorators: `@ApiTags`, `@ApiOperation`, response decorators.
- Phase 4: Exception registry registered in `onModuleInit()`.

## Boundaries

- A BC's `shared/` holds the cross-module VOs and the BC's shared NestJS module, which `SharedModule` imports.
- Each submodule has its own NestJS module and exception registry, in `{bc}/{module}/infrastructure/framework/`. `SharedModule` never imports a submodule directly.

## Phase 7 — Swagger

Skill: `api-rest`. Per GET endpoint: `@ApiOperation`, `@ApiBearerAuth('access-token')`, `@ApiProperty`/`@ApiPropertyOptional` on Query/Payload, `@ApiResponse` with the envelope schema `{ data, meta }`, codes 401/422. Only `@ApiTags` = incomplete.

Anti-pattern: a controller with only `@ApiTags` — no `@ApiOperation` or response schema.
