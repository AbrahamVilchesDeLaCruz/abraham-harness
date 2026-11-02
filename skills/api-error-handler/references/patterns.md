# Error handling: patterns and examples

Framework code for the filter and the registries lives in the project's stack skill, in `references/api-error-handler.md`.

### Error system architecture

```
shared/infrastructure/exceptions/
├── global-exception-registry.ts   ← global registry (Map<exceptionName, status>)
└── http-exception.filter.ts       ← catches everything — applies the registry

{feature}/infrastructure/framework/
└── {feature}-exception-registry.ts  ← registers the module's errors in the module-initialization hook
```

### GlobalExceptionRegistry — shared

```typescript
// shared/infrastructure/exceptions/global-exception-registry.ts
export class GlobalExceptionRegistry {
  private readonly statusCodes = new Map<string, number>();

  register(registry: Map<string, number>): void {
    registry.forEach((status, exception) => {
      this.statusCodes.set(exception, status);
    });
  }

  getStatusCode(exceptionName: string): number | undefined {
    return this.statusCodes.get(exceptionName);
  }
}
```

### HttpExceptionFilter — shared

`HttpExceptionFilter` catches every exception. It receives `GlobalExceptionRegistry` and the `LOGGER_SERVICE` port:

- Defaults: status `500`, message `'Internal server error'`, `errorType` `null`.
- A framework HTTP exception keeps its own status and response as the message.
- Any other `Error`: use the status registered for `exception.constructor.name` when there is one; the message is `exception.message` and `errorType` is `exception.constructor.name`.
- Logs with the context `{ status, path, method, errorType }`: `status >= 500` logs an error `'Unhandled exception'`; `status >= 400` with an `errorType` logs a warning with the error message; any other `status >= 400` logs a warning with the message, or `'HTTP client error'` when the message is not a string.
- Responds with `status` and the JSON body `{ statusCode, message, errorType, path, timestamp }`, where `timestamp` is `new Date().toISOString()`.

### Exception Registry per module

`ProductExceptionRegistry` lives in `products/infrastructure/framework/product-exception-registry.ts`. It receives `GlobalExceptionRegistry` and, in the module-initialization hook, registers a `Map<string, number>` with `ProductNotFound.name` → not found, `ProductNameEmpty.name` → unprocessable entity and `ProductAlreadyExists.name` → conflict.

Register it as a provider in the module.

## Anti-patterns

```typescript
// ❌ Domain error with an HTTP status
export class ProductNotFound extends DomainException {
  readonly statusCode = 404; // the domain knows nothing about HTTP
}

// ❌ Global registry with all the errors of all modules
globalRegistry.register(new Map([
  [ProductNotFound.name, 404],
  [OrderNotFound.name, 404],   // this belongs in order-exception-registry.ts
]));
```

A try/catch in a controller to map errors to HTTP exceptions is also forbidden.
