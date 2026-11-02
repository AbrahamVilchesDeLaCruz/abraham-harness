# Observability Implementations — Reference

## `PinoLogger` — implementación concreta

```typescript
// src/shared/infrastructure/logger/pino-logger.ts
import { Injectable } from '@nestjs/common';
import pino, { type Logger as PinoInstance } from 'pino';
import { type LogContext, type Logger } from '@/shared/domain/logger';

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
          // stdout — pretty en dev, JSON raw en prod
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

          // Loki — solo si LOKI_URL está definida (Fase 2)
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

Registro en `SharedModule`:

```typescript
{ provide: LOGGER_SERVICE, useClass: PinoLogger }
```

---

## `PrometheusAppMetrics` — métricas de negocio custom

```typescript
// src/shared/infrastructure/metrics/prometheus-app-metrics.ts
import { Inject, Injectable } from '@nestjs/common';
import { Counter, Registry } from 'prom-client';
import { type AppMetrics } from '@/shared/domain/app-metrics';
import { METRICS_REGISTRY } from '@/shared/domain/metrics-registry';

@Injectable()
export class PrometheusAppMetrics implements AppMetrics {
  private readonly counters = new Map<string, Counter>();

  constructor(
    @Inject(METRICS_REGISTRY)
    private readonly registry: Registry,
  ) {
    // Pre-registra contadores conocidos con sus metadatos
    this.register('app_products_created_total', 'Total products created', []);
    this.register('app_orders_started_total', 'Total orders started', []);
    this.register('app_orders_completed_total', 'Total orders completed', []);
    this.register('app_audio_generated_total', 'Total image files generated', ['provider']);
    this.register('app_audio_errors_total', 'Total image generation errors', ['provider']);
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

Registro en `ObservabilityModule` (no en SharedModule):

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
    // MetricsInterceptor también vive aquí (APP_INTERCEPTOR)
  ],
  exports: [METRICS_REGISTRY, APP_METRICS],
})
export class ObservabilityModule {}
```

> **No se usa `@willsoto/nestjs-prometheus`** — la implementación usa `prom-client` directamente inyectando `METRICS_REGISTRY` (un `Registry` de prom-client).

---

## Logging en Subscriber — con retry

```typescript
async handle(event: DomainEvent): Promise<void> {
  this.logger.info('Processing event', { queue: this.queueName, eventId: event.eventId });

  try {
    await this.useCase.execute({ ... });
  } catch (error) {
    this.logger.error('Handler failed', error as Error, {
      queue: this.queueName,
      eventId: event.eventId,
    });
    throw error; // re-throw — permite retry y DLQ
  }
}
```

---

## Logging en HttpExceptionFilter

```typescript
catch(exception: unknown, host: ArgumentsHost): void {
  const logContext = { status, path: request.url, method: request.method, errorType };

  if (statusCode >= 500) {
    this.logger.error(
      'Unhandled exception',
      exception instanceof Error ? exception : undefined,
      logContext,
    );
  } else if (statusCode >= 400 && errorType !== null) {
    // Domain exception — usa su propio mensaje
    this.logger.warn(exception instanceof Error ? exception.message : 'Domain error', logContext);
  } else if (statusCode >= 400) {
    // 4xx de NestJS (ValidationPipe, HttpException manual)
    this.logger.warn(typeof message === 'string' ? message : 'HTTP client error', logContext);
  }
}
```

> El contexto incluye `{ status, path, method, errorType }` — **no** `requestId`.

---

## Métricas HTTP automáticas (`MetricsInterceptor`)

El `MetricsInterceptor` registra en cada request:

- `http_requests_total{method, route, status_code}` — contador
- `http_request_duration_seconds{method, route, status_code}` — histograma de latencia

> El label es `status_code` (no `status`). No añadir métricas HTTP manualmente en controllers.

## `Logger` Interface (domain)

```typescript
// src/shared/domain/logger.ts
export type LogContext = Record<string, unknown>;

export interface Logger {
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error, context?: LogContext): void;
  debug(message: string, context?: LogContext): void;
}

export const LOGGER_SERVICE = Symbol('Logger');
```

## `AppMetrics` Interface (domain)

```typescript
// src/shared/domain/app-metrics.ts
export interface AppMetrics {
  increment(metric: string, labels?: Record<string, string>): void;
}

export const APP_METRICS = Symbol('AppMetrics');
```

### Inyección en use case

```typescript
constructor(
  @Inject(LOGGER_SERVICE)
  private readonly logger: Logger,
  @Inject(APP_METRICS)
  private readonly metrics: AppMetrics,
) {}

async execute(request: ...): Promise<...> {
  // ... lógica ...
  this.logger.info('Product created', { productId: id, expression, createdBy });
  this.metrics.increment('app_products_created_total');
}

// Con labels:
this.metrics.increment('app_audio_generated_total', { provider: 'external-provider' });
```

> `APP_METRICS` se inyecta igual que `LOGGER_SERVICE` — el módulo `ObservabilityModule` lo exporta como global.

## Dónde loguear

### Use Case — eventos de negocio

```typescript
async execute(params: { id: string; phrase: string }): Promise<void> {
  const product = Product.create(params);
  await this.repository.save(product);
  await this.eventBus.publish(product.pullDomainEvents());

  this.logger.info('Product created', {
    productId: params.id,
    phrase: params.phrase,
  });
}
```

### Contexto siempre útil

```typescript
// ✅ Con identificador del aggregate
this.logger.info('Product updated', { productId, userId, field: 'phrase' });
this.logger.error('Image generation failed', error, { productId, provider: 'external-provider' });

// ❌ Sin contexto
this.logger.info('Updated');
this.logger.error(error.message);
```
