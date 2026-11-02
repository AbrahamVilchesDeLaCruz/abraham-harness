# Observability — docs/engineering/backend-architecture.md

Pino and Prometheus details for the concepts in `docs/engineering/backend-architecture.md`.

- The Logger implementation in `shared/infrastructure/` is `PinoLogger`.
- **`MetricsInterceptor`** — intercepts each HTTP request and records duration and count in prom-client.
- **`MetricsGetController`** — exposes `GET /metrics` so that Prometheus can scrape it.
- **`ObservabilityModule`** — registers the prom-client Registry, the global interceptor and the controllers.
- `PrometheusAppMetrics` implements `AppMetrics` in `shared/infrastructure/metrics/`.
