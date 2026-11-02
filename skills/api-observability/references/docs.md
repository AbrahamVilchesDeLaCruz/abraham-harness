# api-observability — Docs & References

## Related Skills

| Skill | Por qué leerla |
|---|---|
| `api-shared` | `SharedModule` — donde se registra `PinoLogger` con `LOGGER_SERVICE` |
| `api-application` | Use cases — donde se inyecta y usa el `Logger` |
| `api-events` | Subscribers — donde se loguea `info` al procesar y `error` al fallar |
| `api-error-handler` | `HttpExceptionFilter` — donde se loguea automáticamente |

## Architectural Decision

## External Documentation

- [Pino — Docs](https://getpino.io/#/) — logger JSON de alto rendimiento
- [NestJS-Pino](https://github.com/iamolegga/nestjs-pino) — integración NestJS alternativa
- [OpenTelemetry — Node.js](https://opentelemetry.io/docs/languages/js/getting-started/nodejs/) — SDK de instrumentación
- [Prometheus — Data Model](https://prometheus.io/docs/concepts/data_model/) — métricas, labels, tipos (Counter, Histogram)
- [Grafana — Loki](https://grafana.com/docs/loki/latest/) — agregación de logs
- [willsoto/nestjs-prometheus](https://github.com/willsoto/nestjs-prometheus) — integración Prometheus + NestJS

## Setup

Ver `resources/setup.md` para la configuración completa de Loki, Prometheus, Grafana y OpenTelemetry.

## Structured logging format

Pino emite JSON en una línea por log. Ejemplo:

```json
{"level":"info","time":"2026-05-21T12:00:00.000Z","productId":"abc123","name":"what is liaison","msg":"Product created"}
{"level":"error","time":"2026-05-21T12:00:01.000Z","productId":"abc123","provider":"external-provider","err":{"type":"Error","message":"timeout","stack":"..."},"msg":"Image generation failed"}
```
