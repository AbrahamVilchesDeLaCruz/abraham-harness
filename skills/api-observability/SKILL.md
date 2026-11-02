---
name: api-observability
description: "Trigger: When adding logging in use cases, configuring metrics, or setting up tracing. Logger interface, structured logs, metrics and traces in apps/api/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## Activation Contract

- When adding logging in a use case, subscriber or filter
- When deciding which log level to use (info/warn/error/debug)
- When adding custom business metrics

## Hard Rules

- The `Logger` and `AppMetrics` interfaces live in `shared/domain/` — never import logging, metrics or tracing libraries in domain/application
- Log **business events** in use cases (`info`)
- Increment business metrics in use cases with `this.metrics.increment('app_<metric>_total')`
- Log **errors with the full `Error` object** — it preserves the stack trace
- **Do not log in controllers** — the filter and interceptor do it automatically
- Re-throw in subscribers after logging — for retry and DLQ
- `APP_METRICS` is registered in `ObservabilityModule`, not in `SharedModule`
- `APP_METRICS` is injected the same way as `LOGGER_SERVICE` — the `ObservabilityModule` module exports it globally.
- Always log with context: the aggregate identifier; never without context.
- The tracing SDK instruments and exports — it is not a storage.
- `AppMetrics` only has `increment` — all business counters are counters.
- There is no `gauge` or `histogram` in the domain interface: `MetricsInterceptor` manages the HTTP histograms directly.

## Decision Gates

The 3 signals:

| Signal | What it captures |
|---|---|
| Logs | What happened and when |
| Metrics | How much and how often |
| Traces | How a request traveled internally |

| Method | When |
|---|---|
| `info` | Business action completed (product created, session started) |
| `warn` | Unexpected but recoverable situation (retry, fallback) |
| `error` | Error that impacts the user or breaks the flow |
| `debug` | Technical detail — only in development |

| Metric | Labels | Where it is incremented |
|---|---|---|
| `app_products_created_total` | — | `ProductCreator` |
| `app_orders_started_total` | — | `OrderStarter` |
| `app_orders_completed_total` | — | `OrderCompleter` |
| `app_image_generated_total` | `provider` | `ProductImageGenerator` |
| `app_auth_logins_total` | `provider` | `UserAuthenticator` |
| `app_auth_registrations_total` | `provider` | `UserRegistrar` |

## References

- [`references/implementations.md`](references/implementations.md) — logging in subscribers and in the exception filter; `Logger` and `AppMetrics` interfaces, injection in a use case and where to log.
- [`references/docs.md`](references/docs.md) — related skills, ADRs and documentation.
- Load the project's stack skill for observability (`stack-observability`) and read its `references/api-observability.md` for the logger and metrics adapters and the infrastructure setup.
- Load the project's stack skill for the HTTP framework (`stack-nestjs`) and read its `references/api-observability.md` for injection, the exception filter and module registration.
