---
name: api-di
description: "Trigger: Al definir tokens de inyección, registrar providers en módulos, o inyectar dependencias en use cases o controllers. Tokens Symbol, registro de providers, inyección sin acoplamiento en apps/api/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

- Al definir el token de inyección para un repositorio, servicio o cualquier abstracción
- Al registrar providers en un módulo
- Al inyectar dependencias en use cases o controllers

## Hard Rules

- El dominio y la aplicación **no deben saber que NestJS existe**. Para lograrlo, cada interfaz tiene un token de inyección propio que no importa nada de `@nestjs/common`.
- Los tokens son `Symbol` — **siempre** — no strings (colisiones), no clases de NestJS (acoplamiento).
- El token se define en el mismo archivo que la interface — en la capa de domain o shared/domain
- Los use cases inyectan por **interface** — nunca por clase concreta
- El tipo del parámetro es la **interface** — nunca la implementación concreta. `@Inject(TOKEN)` es el único rastro de NestJS en application/domain.
- Los módulos son los únicos que conocen las implementaciones concretas (TypeORM, RabbitMQ, etc.)
- Un módulo exporta el **token** — nunca la clase de implementación
- Formato siempre `SCREAMING_SNAKE_CASE`.

## Decision Gates

### Registro en el módulo

| Situación | Provider |
| --- | --- |
| Caso más común (repositorios, servicios) | `useClass` |
| Singleton compartido bajo múltiples tokens | `useExisting` |
| Providers que dependen de múltiples instancias | `useFactory` |

### Naming Conventions

| Abstracción | Token | Ejemplo |
|---|---|---|
| Repositorio | `{ENTITY}_REPOSITORY` | `ORDER_REPOSITORY`, `USER_REPOSITORY` |
| Query de solo lectura | `{ENTITY}_QUERY` | `ORDER_STATS_QUERY`, `USER_STATS_QUERY` |
| Selector de dominio | `{ENTITY}_SELECTOR` | `PRODUCT_SELECTOR` |
| Provider de dominio | `{ENTITY}_PROVIDER` | `WEAKEST_PRODUCT_IDS_PROVIDER` |
| Servicio externo | `{ENTITY}_SERVICE` | `AUDIO_SERVICE` |
| Publisher de eventos | `DOMAIN_EVENT_PUBLISHER` | shared — publica eventos de dominio |
| Consumer de eventos | `DOMAIN_EVENT_CONSUMER` | shared — consume colas AMQP |
| Logger | `LOGGER_SERVICE` | shared — interface Logger |
| Métricas | `APP_METRICS` | shared — interface AppMetrics |

## Execution Steps

1. Define la interface y su token en el mismo archivo, con el nombre de la tabla.
2. Registra token → implementación en el módulo con el provider que corresponda.
3. Inyecta con `@Inject(TOKEN)` tipando el parámetro con la interface.

## Output Contract

Entrega la interface con su token `Symbol`, el registro en el módulo y la inyección en el use case o controller.

## References

- [`references/patterns.md`](references/patterns.md): flujo interface → token → implementación → registro → inyección, y código de cada paso.
- Usa el template de [`assets/di-tokens.template.md`](assets/di-tokens.template.md) al añadir tokens y módulos a un nuevo BC.
- Lee [`references/docs.md`](references/docs.md) para el rationale de Symbol vs string y docs externos.
