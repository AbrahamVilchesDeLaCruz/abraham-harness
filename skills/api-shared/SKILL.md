---
name: api-shared
description: "Trigger: Al crear o modificar SharedModule, añadir validación de variables de entorno con Joi, o infraestructura transversal. SharedModule global, bounded context shared, env validation Joi en apps/api/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.1"
---

## Activation Contract

- Al crear o modificar el módulo `SharedModule` global
- Al crear un shared interno de un bounded context
- Al añadir validación de variables de entorno
- Al registrar infraestructura transversal (logger, event bus, filtros globales)

## Hard Rules

### Módulos

- `SharedModule` se importa **una sola vez** en `AppModule` — es `@Global()`
- `ConfigModule.forRoot()` y `TypeOrmModule.forRootAsync()` se configuran en **`AppModule`**, no en `SharedModule`.
- `ConfigModule` se declara `isGlobal: true` para que `ConfigService` esté disponible en todos los módulos
- TypeORM se configura mediante `buildTypeOrmDataSourceOptions()` que parsea `DATABASE_URL`
- `SharedModule` no importa ni re-exporta `ConfigModule` ni `TypeOrmModule`
- Los bounded context modules **no son globales** — se importan explícitamente en `AppModule`
- BC modules exportan solo lo que otros BCs necesitan (tokens de repositorio o domain services)
- `synchronize: false` **siempre** — las migraciones son la fuente de verdad del schema

### Env

- `abortEarly: false` siempre — ver todos los errores de una
- `.required()` en todo lo que no tiene default — falla en bootstrap, no en runtime
- **Joi para env** — no Zod. Es la integración nativa de `@nestjs/config`
- La configuración vive en `ConfigModule.forRoot()` **en `AppModule`**, no en `SharedModule`
- La validación de env falla en bootstrap — si falta una variable, la app no arranca

### Criteria + TypeORM

- El patrón Criteria se aplica **directamente en cada repositorio** con QueryBuilder — no hay un converter compartido. Cada repositorio aplica sus propios filtros porque puede tener relaciones y aliases distintos.
- Ver implementación canónica en skill `api-criteria`.

## Decision Gates

### SharedModule — lo que exporta

`SharedModule` provee infraestructura transversal que todos los módulos necesitan sin importarla explícitamente:

| Token / clase | Implementación | Descripción |
|---|---|---|
| `LOGGER_SERVICE` | `PinoLogger` | Logger estructurado |
| `DOMAIN_EVENT_PUBLISHER` | `AmqpMessageBus` | Publica eventos al bus |
| `DOMAIN_EVENT_CONSUMER` | `AmqpMessageBus` | Consume eventos del bus |
| `GlobalExceptionRegistry` | — | Registry central de excepciones |
| `HttpExceptionFilter` | — | Filtro HTTP global (vía `APP_FILTER`) |

### Shared interno por bounded context

Los bounded contexts con múltiples submódulos tienen un `shared/` propio que contiene:

| Carpeta | Contenido |
| --- | --- |
| **`domain/`** | value objects, interfaces o constantes que cruzan submódulos dentro del BC |
| **`infrastructure/framework/`** | el módulo NestJS del BC completo (wiring), exception registry del BC |

## Execution Steps

1. Ubica la pieza en la estructura de `references/patterns.md`.
2. Aplica las Hard Rules de módulos y env.
3. Usa `references/module-patterns.md` para los módulos completos y el schema Joi.

## Output Contract

Entrega la pieza en su carpeta de `shared/` y los cambios de wiring en `SharedModule`, `AppModule` o el módulo del BC.

## References

- [`references/patterns.md`](references/patterns.md): estructura de `shared/`, shared interno por BC y validación de env.
- Lee [`references/module-patterns.md`](references/module-patterns.md) para los módulos completos (`SharedModule`, `AppModule`, `AchievementModule`) y el schema Joi de variables de entorno.
- Lee [`references/docs.md`](references/docs.md) para skills relacionadas, ADRs y documentación externa.
