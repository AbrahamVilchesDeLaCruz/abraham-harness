# Observability Implementations — Reference

The logger and metrics adapters are in the observability stack skill, in `references/api-observability.md`.

## Logging in a Subscriber — with retry

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
    throw error; // re-throw — enables retry and DLQ
  }
}
```

---

## Logging in the exception filter

```typescript
catch(exception: unknown, host): void {
  const logContext = { status, path: request.url, method: request.method, errorType };

  if (statusCode >= 500) {
    this.logger.error(
      'Unhandled exception',
      exception instanceof Error ? exception : undefined,
      logContext,
    );
  } else if (statusCode >= 400 && errorType !== null) {
    // Domain exception — uses its own message
    this.logger.warn(exception instanceof Error ? exception.message : 'Domain error', logContext);
  } else if (statusCode >= 400) {
    // framework 4xx (validation errors, manual HTTP exceptions)
    this.logger.warn(typeof message === 'string' ? message : 'HTTP client error', logContext);
  }
}
```

> The context includes `{ status, path, method, errorType }` — **not** `requestId`.

---

## Automatic HTTP metrics (`MetricsInterceptor`)

`MetricsInterceptor` records on each request:

- `http_requests_total{method, route, status_code}` — counter
- `http_request_duration_seconds{method, route, status_code}` — latency histogram

> The label is `status_code` (not `status`). Do not add HTTP metrics manually in controllers.

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

### Injection in a use case

```typescript
constructor(
  private readonly logger: Logger,
  private readonly metrics: AppMetrics,
) {}

async execute(request: ...): Promise<...> {
  // ... logic ...
  this.logger.info('Product created', { productId: id, name, createdBy });
  this.metrics.increment('app_products_created_total');
}

// With labels:
this.metrics.increment('app_image_generated_total', { provider: 'external-provider' });
```

> `APP_METRICS` is injected the same way as `LOGGER_SERVICE` — the `ObservabilityModule` module exports it globally.

## Where to log

### Use case — business events

```typescript
async execute(params: { id: string; name: string }): Promise<void> {
  const product = Product.create(params);
  await this.repository.save(product);
  await this.eventBus.publish(product.pullDomainEvents());

  this.logger.info('Product created', {
    productId: params.id,
    name: params.name,
  });
}
```

### Context is always useful

```typescript
// ✅ With the aggregate identifier
this.logger.info('Product updated', { productId, userId, field: 'name' });
this.logger.error('Image generation failed', error, { productId, provider: 'external-provider' });

// ❌ No context
this.logger.info('Updated');
this.logger.error(error.message);
```
