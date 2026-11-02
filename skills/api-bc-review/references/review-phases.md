# Bounded Context Review — Fases detalladas

## Fase 2 — ¿Un BC o submódulos DDD?

Si el BC tiene **múltiples agregados cohesivos**, dividir:

```
apps/api/src/{bc}/
├── {module-a}/     ← dueño agregado A
├── {module-b}/     ← dueño agregado B
└── shared/         ← VOs cross-módulo + NestJS module + exception registry
```

Ver `apps/api/AGENTS.md` → *Módulos DDD dentro de un Bounded Context*.

Ejemplo `achievement`:
- `catalog/` — definiciones de logros (catálogo, reglas de unlock)
- `progress/` — agregado `UserAchievementProgress` (contadores, módulos tocados)
- `user-achievement/` — desbloqueos por usuario
- `shared/` — `AchievementKey`, `AchievementCategory`, `AchievementModule`

**Prohibido:** capas sueltas (`domain/`, `application/`) en la raíz del BC cuando hay submódulos.

## Fase 3 — Checklist de alineación por capa

Usar como tabla de auditoría. Cargar la skill indicada antes de corregir cada fila.

| Área | Skill | Qué verificar |
|------|-------|---------------|
| Aggregate + VOs | `api-domain` | `AggregateRoot`, `fromPrimitives`/`toPrimitives`, VOs sin sufijo |
| Domain errors | `api-domain`, `api-error-handler` | `{Entidad}{Problema}`, registry en `shared/infrastructure/framework/` |
| Repository | `api-domain` | Contrato `match/search/save/remove`, `toDomain`/`toEntity` |
| Use cases | `api-application` | `{Entidad}{Verbo}`, método `execute()`, primitivos in/out |
| Domain services | `api-application`, `api-domain` | En `domain/`, **sin sufijo `Service`** en clase/archivo |
| Subscribers | `api-events` | Junto al use case, `on()` solo delega, queue naming |
| Eventos | `api-domain-events` | `record()` en aggregate, `pullDomainEvents()` tras `save()` |
| Controllers query | `api-response`, `api-rest` | `ApiResponse.of()` / `PaginatedApiResponse.of()` con `meta` |
| Controllers command | `api-response` | Solo status HTTP, sin body |
| DI | `api-di` | Token `Symbol` junto a interface en domain |
| Tests | `api-testing` | Espejan estructura `test/{bc}/{module}/`, Object Mothers |

## Fase 4 — Naming: sufijos permitidos

| Sufijo | Cuándo |
|--------|--------|
| `Repository` | Interface de persistencia en domain |
| `Event` | Domain events |
| `Exception` / error de dominio | Errores tipados |
| `Entity` | TypeORM en infrastructure |
| `TypeOrm` (prefijo) | Implementación concreta de repo/query |

**Prohibido** en clases/archivos de dominio y application:
- `Service` — usar `AchievementCatalogFinder`, `ProductFinder`
- `Dto` en application — usar `Request*` / `Response*`
- `.response.ts` por controller

## Fase 6 — Fuente de verdad duplicada

Señales de alerta (ej. `achievement` pre-refactor):
- Catálogo en código **y** en DB sin uso
- Reglas hardcodeadas en subscribers **y** en evaluators
- i18n en cliente **y** title/description en API sin contrato

Decidir **una** fuente y documentar en ADR si es decisión de producto.

**Paridad código ↔ migraciones:** si el catálogo vive en dominio, añadir test de paridad (`{bc}-catalog-parity.spec.ts`) que compare keys del catálogo con seed de migraciones y `ALL_*_KEY_VALUES`.

## Fase 7 — Operabilidad, contrato y documentación

Auditar **después** de límites y capas DDD. Cargar la skill indicada antes de corregir cada fila.

| Área | Skill | Qué verificar |
|------|-------|---------------|
| **Logger** | `api-observability` | `LOGGER_SERVICE` inyectado en domain services / use cases que mutan estado relevante (`unlock`, `create`, `import`). Log `info` con contexto (`userId`, aggregate id). **No** loguear en controllers — lo hace el filter/interceptor |
| **Swagger** | `api-rest` | Por endpoint GET: `@ApiOperation`, `@ApiBearerAuth('access-token')`, `@ApiProperty`/`@ApiPropertyOptional` en Query/Payload, `@ApiResponse` con schema del envelope `{ data, meta }`, códigos 401/422. Solo `@ApiTags` = incompleto |
| **Docs BC** | — | `docs/apps/api/{bc}/README.md`: submódulos, endpoints, eventos consumidos/publicados, tablas, handlers **v2** (nombres reales de subscribers) |
| **Docs transversales** | — | Sincronizar si el BC emite/consume eventos: la spec de la feature, `docs/domain/bounded-contexts.md` (diagrama + tabla), `docs/domain/rabbitmq-design.md` (exchanges, colas, handlers) |
| **TypeORM** | `api-migrations` | Toda entidad nueva en `typeOrmEntities` **y** su migración en `typeOrmMigrations`. Omitirlo rompe E2E/CI silenciosamente vía subscribers async |
| **E2E API** | `api-testing` | `test/{bc}/**/infrastructure/*.e2e-spec.ts`: JWT, envelope, happy path de negocio, validación 422. Reutilizar helpers de otros BCs (`registerAndLogin`, `waitUntil`) |
| **Object Mothers** | `api-testing` | `test/{bc}/{module}/domain/*-mother.ts` para aggregates/VOs usados en ≥2 specs. Evitar `fromPrimitives` inline repetido |
| **Tests de dominio crítico** | `api-testing` | Policies, strategies y reglas de elegibilidad con tests propios (no solo vía unlocker integration) |
| **Cliente** | `client-api` | `ApiEnvelope<T>` en fetches, mapper + types, i18n si API devuelve solo keys estructurales |
| **Métricas custom** | `api-observability` | Opcional — contadores Prometheus en mutaciones clave (`*_total`). Infra HTTP/AMQP ya cubierta globalmente |

### Señales de lag documental (ej. `achievement` pre-fix)

- Handler names v1 en spec (`UnlockAchievementOnOrderCompleted` vs `UnlockUserAchievementOnOrderCompleted`)
- Eventos consumidos incompletos (`PaymentRecorded`/`ProductViewed` faltaban en bounded-contexts)
- Colas RabbitMQ sin documentar (`update_progress_on_payment_recorded`)
- README sin tablas nuevas (`user_achievement_progress`)

## Anti-patterns

```typescript
// ❌ BC entero dentro de identity/user porque se muestra en /profile
// ❌ Subscriber con reglas de negocio en on()
// ❌ Evento publicado manualmente en use case sin aggregate.record()
// ❌ GET devuelve { data } sin meta
// ❌ achievement-catalog-finder.service.ts  ← sufijo Service prohibido
// ❌ Controller solo con @ApiTags — sin @ApiOperation ni schema de respuesta
// ❌ Unlock/mutación de negocio sin logger.info con contexto
// ❌ Entidad TypeORM sin registrar en typeorm-data-source-options.ts
// ❌ Nuevo subscriber sin fila en rabbitmq-design.md y bounded-contexts.md
// ❌ E2E que solo mockea unit — ningún *.e2e-spec.ts para el endpoint HTTP
```
