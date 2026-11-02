# api-observability with NestJS

Apply the rules of `api-observability`. This reference shows the NestJS wiring.

## Registering the logger

`PinoLogger` is registered in `SharedModule` with `LOGGER_SERVICE`:

```typescript
{ provide: LOGGER_SERVICE, useClass: PinoLogger }
```

`APP_METRICS` is registered in `ObservabilityModule`, not in `SharedModule`. `MetricsInterceptor` lives there too, as an `APP_INTERCEPTOR`. See the module in `stack-observability`, in `references/api-observability.md`.

## Logging in `HttpExceptionFilter`

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
    // Domain exception — uses its own message
    this.logger.warn(exception instanceof Error ? exception.message : 'Domain error', logContext);
  } else if (statusCode >= 400) {
    // NestJS 4xx (ValidationPipe, manual HttpException)
    this.logger.warn(typeof message === 'string' ? message : 'HTTP client error', logContext);
  }
}
```

## Injection in a use case

```typescript
constructor(
  @Inject(LOGGER_SERVICE)
  private readonly logger: Logger,
  @Inject(APP_METRICS)
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

## External Documentation

- [NestJS-Pino](https://github.com/iamolegga/nestjs-pino) — alternative NestJS integration
