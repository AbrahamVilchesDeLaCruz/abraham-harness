# api-observability with pino, Prometheus and OpenTelemetry

Apply the rules of `api-observability`. This reference shows the adapters and the infrastructure.

## Rules

- Never import pino, prom-client or OTel in domain/application.
- OpenTelemetry is the SDK that instruments and exports — it is not a storage.
- All business counters are Prometheus `Counter`s.

## The 3 signals

| Signal | Storage | Queried in |
|---|---|---|
| Logs | Loki | Grafana |
| Metrics | Prometheus | Grafana |
| Traces | Tempo | Grafana |

## `PinoLogger` — concrete implementation

```typescript
// src/shared/infrastructure/logger/pino-logger.ts
import { Injectable } from '@nestjs/common';
import pino, { type Logger as PinoInstance } from 'pino';
import { type LogContext, type Logger } from '@/shared/domain/logger.js';

@Injectable()
export class PinoLogger implements Logger {
  private readonly logger: PinoInstance;

  constructor() {
    const isDev = process.env.NODE_ENV !== 'production';
    const lokiUrl = process.env.LOKI_URL;
    const level = process.env.LOG_LEVEL ?? 'info';

    this.logger = pino(
      {
        level,
        formatters: {
          level: (label) => ({ level: label }),
        },
        timestamp: pino.stdTimeFunctions.isoTime,
      },
      pino.transport({
        targets: [
          // stdout — pretty in dev, raw JSON in prod
          isDev
            ? {
                target: 'pino-pretty',
                level,
                options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' },
              }
            : {
                target: 'pino/file',
                level,
                options: { destination: 1 }, // stdout
              },

          // Loki — only if LOKI_URL is defined (Phase 2)
          ...(lokiUrl
            ? [
                {
                  target: 'pino-loki',
                  level,
                  options: {
                    host: lokiUrl,
                    labels: { app: 'myapp-api', env: process.env.NODE_ENV ?? 'development' },
                    replaceTimestamp: true,
                    silenceErrors: false,
                  },
                },
              ]
            : []),
        ],
      }),
    );
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(context ?? {}, message);
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(context ?? {}, message);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.logger.error({ ...context, err: error }, message);
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(context ?? {}, message);
  }
}
```

## `PrometheusAppMetrics` — custom business metrics

```typescript
// src/shared/infrastructure/metrics/prometheus-app-metrics.ts
import { Inject, Injectable } from '@nestjs/common';
import { Counter, Registry } from 'prom-client';
import { type AppMetrics } from '@/shared/domain/app-metrics.js';
import { METRICS_REGISTRY } from '@/shared/domain/metrics-registry.js';

@Injectable()
export class PrometheusAppMetrics implements AppMetrics {
  private readonly counters = new Map<string, Counter>();

  constructor(
    @Inject(METRICS_REGISTRY)
    private readonly registry: Registry,
  ) {
    // Pre-registers known counters with their metadata
    this.register('app_products_created_total', 'Total products created', []);
    this.register('app_orders_started_total', 'Total orders started', []);
    this.register('app_orders_completed_total', 'Total orders completed', []);
    this.register('app_image_generated_total', 'Total image files generated', ['provider']);
    this.register('app_image_errors_total', 'Total image generation errors', ['provider']);
    this.register('app_auth_logins_total', 'Total successful logins', ['provider']);
    this.register('app_auth_registrations_total', 'Total user registrations', ['provider']);
  }

  increment(metric: string, labels: Record<string, string> = {}): void {
    const counter = this.getOrCreate(metric, Object.keys(labels));
    counter.inc(labels);
  }

  private register(name: string, help: string, labelNames: string[]): void { /* ... */ }
  private getOrCreate(name: string, labelNames: string[]): Counter { /* ... */ }
}
```

Registration in `ObservabilityModule` (not in SharedModule):

```typescript
// src/observability/infrastructure/framework/observability.module.ts
@Global()
@Module({
  providers: [
    {
      provide: METRICS_REGISTRY,
      useFactory: (): Registry => {
        const registry = new Registry();
        registry.setDefaultLabels({ app: 'myapp-api' });
        collectDefaultMetrics({ register: registry });
        return registry;
      },
    },
    PrometheusAppMetrics,
    { provide: APP_METRICS, useExisting: PrometheusAppMetrics },
    // MetricsInterceptor also lives here (APP_INTERCEPTOR)
  ],
  exports: [METRICS_REGISTRY, APP_METRICS],
})
export class ObservabilityModule {}
```

> **`@willsoto/nestjs-prometheus` is not used** — the implementation uses `prom-client` directly by injecting `METRICS_REGISTRY` (a prom-client `Registry`).

## Structured logging format

Pino emits one line of JSON per log. See the example in `api-observability`, in `references/docs.md`.

## Setup & infrastructure

> This section is a quick reference summary.

### Phases

| Phase | What | When |
|---|---|---|
| 1 | Pino (stdout JSON) + prom-client `/metrics` | Now — development |
| 2 | Loki + Prometheus + Grafana in Docker Compose | Before the production deploy |
| 2 | OTel SDK + Tempo (traces) | Together with Phase 2 |

### Environment variables

```bash
# Phase 1
LOG_LEVEL=info

# Phase 2 additions
LOKI_URL=http://loki:3100
OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4318/v1/traces
OTEL_SERVICE_NAME=myapp-api
GRAFANA_ADMIN_PASSWORD=<from-your-secret-manager>
```

### Ports (dev — host → container)

| Service | Host port | Container port |
|---|---|---|
| API `/metrics` | 3001 | 3000 |
| Grafana | 3002 | 3000 |
| Prometheus | 9090 | 9090 |
| Loki | 3100 | 3100 |

## External Documentation

- [Pino — Docs](https://getpino.io/#/) — high-performance JSON logger
- [OpenTelemetry — Node.js](https://opentelemetry.io/docs/languages/js/getting-started/nodejs/) — instrumentation SDK
- [Prometheus — Data Model](https://prometheus.io/docs/concepts/data_model/) — metrics, labels, types (Counter, Histogram)
- [Grafana — Loki](https://grafana.com/docs/loki/latest/) — log aggregation
- [willsoto/nestjs-prometheus](https://github.com/willsoto/nestjs-prometheus) — Prometheus + NestJS integration
