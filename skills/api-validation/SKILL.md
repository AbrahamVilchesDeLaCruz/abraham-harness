---
name: api-validation
description: "Trigger: Al configurar ValidationPipe en main.ts, crear Payload o Query DTOs con class-validator, o guards globales. ValidationPipe global, Payload/Query con class-validator en apps/api/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

- Al configurar el `ValidationPipe` global en `main.ts`
- Al crear un `Payload` (body) o `Query` (query params) con `class-validator`
- Al definir guards globales y filtros globales en bootstrap

## Hard Rules

### ValidationPipe

- `whitelist: true` + `forbidNonWhitelisted: true` — **siempre** — rechaza campos extra
- `transform: true` + `errorHttpStatusCode: 422` — **siempre** — habilita `@Type()` en queries y mapea errores de validación a 422

### Payload

- Nombre: `{Action}{Entity}{Method}Payload` → `CreateProductPostPayload`
- Todos los campos son **strings, números o arrays primitivos** — sin Value Objects
- Nunca `@Type()` en Payloads — el body JSON ya viene tipado
- Los `example` usan strings UUID hardcodeados — no se importan Value Objects en Payloads

### Payload y Query

- `@Type(() => Number)` **solo en Query** para `page`, `pageSize`, `limit` y similares — query params llegan como string desde HTTP
- `@ApiProperty` / `@ApiPropertyOptional` en todos los campos de Payload y Query — Swagger es obligatorio; en Payload, con `example`

### Guards y filtros

- **Guards y filtros globales no van en `main.ts`** — se registran mediante DI en los módulos de NestJS:
  - `HttpExceptionFilter` → registrado como `APP_FILTER` en `SharedModule`
  - `JwtAuthGuard`, `GuestAuthGuard`, etc. → provistos y exportados desde `AuthModule`
- Los endpoints públicos se marcan con el decorator `@Public()`. Ver skill `api-auth` para el wiring completo.

## Decision Gates

| Campo | Decoradores |
| --- | --- |
| Para campos opcionales simples | `@IsOptional()` + `@ApiPropertyOptional` |
| Para campos que aceptan `null` explícito | `@IsOptional()` + `@ValidateIf((_, v) => v !== null)` para saltar validaciones cuando el valor es `null` |
| Para objetos anidados (arrays de objetos anidados) | `@ValidateNested({ each: true })` + `@Type(() => NestedClass)` + `@IsArray()` |

## Execution Steps

1. Configura `ValidationPipe` en `main.ts` con las opciones de las Hard Rules.
2. Crea el Payload o Query partiendo del template y aplica los Decision Gates.
3. Registra guards y filtros globales por DI, nunca en `main.ts`.

## Output Contract

Entrega la configuración de `main.ts`, el Payload o Query en `infrastructure/controllers/`, o el guard con su decorator `@Public()`.

## References

- [`references/patterns.md`](references/patterns.md): código de bootstrap, Payload, Query, `JwtAuthGuard` y `@Public()`.
- Usa el template de [`assets/payload.template.md`](assets/payload.template.md) al crear Payloads y Queries.
- Lee [`references/docs.md`](references/docs.md) para docs externos de class-validator y ValidationPipe config.
