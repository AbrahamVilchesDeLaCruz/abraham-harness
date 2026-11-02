---
name: api-observability
description: "Trigger: Al añadir logging en use cases, configurar métricas Prometheus, o setup de OpenTelemetry. Logger interface, pino, métricas Prometheus, OTel traces en apps/api/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## Activation Contract

- Al añadir logging en un use case, subscriber o filter
- Al decidir qué nivel de log usar (info/warn/error/debug)
- Al añadir métricas de negocio custom

## Hard Rules

- `Logger` y `AppMetrics` interfaces viven en `shared/domain/` — nunca importar pino, prom-client u OTel en domain/application
- Loguear **eventos de negocio** en use cases (`info`)
- Incrementar métricas de negocio en use cases con `this.metrics.increment('app_<metric>_total')`
- Loguear **errores con el objeto `Error`** completo — preserva stack trace
- **No loguear en controllers** — el filter e interceptor lo hacen automáticamente
- Re-throw en subscribers después de loguear — para retry y DLQ
- `APP_METRICS` se registra en `ObservabilityModule`, no en `SharedModule`
- `APP_METRICS` se inyecta igual que `LOGGER_SERVICE` — el módulo `ObservabilityModule` lo exporta como global.
- Loguear siempre con contexto: identificador del aggregate; nunca sin contexto.
- OpenTelemetry es el SDK que instrumenta y exporta — no es un storage.
- `AppMetrics` solo tiene `increment` — todos los contadores de negocio son `Counter` de Prometheus.
- No hay `gauge` ni `histogram` en la interfaz de dominio: el `MetricsInterceptor` gestiona los histogramas HTTP directamente.

## Decision Gates

Las 3 seÃ±ales:

| Signal | Qué captura | Storage | Consultado en |
|---|---|---|---|
| Logs | Qué pasó y cuándo | Loki | Grafana |
| Metrics | Cuánto y con qué frecuencia | Prometheus | Grafana |
| Traces | Cómo viajó un request por dentro | Tempo | Grafana |

| Método | Cuándo |
|---|---|
| `info` | Acción de negocio completada (product creada, sesión iniciada) |
| `warn` | Situación inesperada pero recuperable (retry, fallback) |
| `error` | Error que impacta al usuario o rompe el flujo |
| `debug` | Detalle técnico — solo en desarrollo |

| Métrica | Labels | Dónde se incrementa |
|---|---|---|
| `app_products_created_total` | — | `ProductCreator` |
| `app_orders_started_total` | — | `OrderStarter` |
| `app_orders_completed_total` | — | `OrderCompleter` |
| `app_audio_generated_total` | `provider` | `ProductAudioGenerator` |
| `app_auth_logins_total` | `provider` | `UserAuthenticator` |
| `app_auth_registrations_total` | `provider` | `UserRegistrar` |

## References

- [`references/implementations.md`](references/implementations.md) — `PinoLogger`, `MetricsService`, logging en subscribers y en `HttpExceptionFilter`; interfaces `Logger` y `AppMetrics`, inyección en use case y dónde loguear.
- [`resources/setup.md`](resources/setup.md) — setup de infraestructura (Loki, Prometheus, Grafana, OTel).
- [`references/docs.md`](references/docs.md) — skills relacionadas, ADRs y documentación externa.
