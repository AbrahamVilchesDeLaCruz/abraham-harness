# api-error-handler with NestJS

The concept skill `api-error-handler` defines the rules. This reference shows how to apply them with NestJS.

## Rules

- The registry is initialized in `onModuleInit()` — this guarantees it is ready before requests arrive.
- `HttpExceptionFilter` uses `@Catch()`, and applies the registry.
- `message` is the response body if the exception is an `HttpException`, and `errorType` is `null` for `HttpException`.
- The registry implements `OnModuleInit` — not the module.
- The registry is declared as a provider of the submodule's NestJS module, and that module exports it.
- The BC's shared NestJS module imports its submodules' modules and re-exports them. `SharedModule` imports only the BCs' shared modules, never a submodule directly.

## Architecture

```
shared/infrastructure/exceptions/
├── global-exception-registry.ts   ← aggregator (Map<exceptionName, HttpStatus> + default response)
└── http-exception.filter.ts       ← @Catch() — applies the registry

{bc}/{module}/infrastructure/framework/
├── {module}.module.ts             ← provides and exports the registry
└── {module}-exception-registry.ts ← registers the submodule's errors in onModuleInit()

{bc}/shared/infrastructure/framework/
└── {bc}-shared.module.ts          ← imports and re-exports the submodules' modules
```

## GlobalExceptionRegistry — shared

```typescript
// shared/infrastructure/exceptions/global-exception-registry.ts
@Injectable()
export class GlobalExceptionRegistry {
  static readonly DEFAULT_RESPONSE = { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Internal server error', errorType: null };

  private readonly statusCodes = new Map<string, number>();

  register(registry: Map<string, number>): void {
    registry.forEach((status, exception) => {
      this.statusCodes.set(exception, status);
    });
  }

  // The mapped status, or the default response when the exception has no mapping
  resolve(exception: unknown): { status: number; message: string; errorType: string | null } {
    const name = exception instanceof Error ? exception.constructor.name : '';
    const status = this.statusCodes.get(name);
    if (status === undefined) return GlobalExceptionRegistry.DEFAULT_RESPONSE;
    return { status, message: (exception as Error).message, errorType: name };
  }
}
```

## HttpExceptionFilter — shared

```typescript
// shared/infrastructure/exceptions/http-exception.filter.ts
@Catch()
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly registry: GlobalExceptionRegistry,
    @Inject(LOGGER_SERVICE) private readonly logger: Logger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | object;
    let errorType: string | null = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else {
      ({ status, message, errorType } = this.registry.resolve(exception));
    }

    const logContext = { status, path: request.url, method: request.method, errorType };

    if (status >= 500) {
      this.logger.error('Unhandled exception', exception instanceof Error ? exception : undefined, logContext);
    } else if (status >= 400 && errorType !== null) {
      this.logger.warn(exception instanceof Error ? exception.message : 'Domain error', logContext);
    } else if (status >= 400) {
      const msg = typeof message === 'string' ? message : 'HTTP client error';
      this.logger.warn(msg, logContext);
    }

    response.status(status).json({
      statusCode: status,
      message,
      errorType,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
```

## Exception Registry per submodule

```typescript
// catalog/product/infrastructure/framework/product-exception-registry.ts
@Injectable()
export class ProductExceptionRegistry implements OnModuleInit {
  constructor(private readonly globalRegistry: GlobalExceptionRegistry) {}

  onModuleInit() {
    this.globalRegistry.register(
      new Map<string, number>([
        [ProductNotFound.name, HttpStatus.NOT_FOUND],
        [ProductNameEmpty.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [ProductAlreadyExists.name, HttpStatus.CONFLICT],
      ]),
    );
  }
}
```

Register it as a provider of the submodule, and export it:

```typescript
// catalog/product/infrastructure/framework/product.module.ts
@Module({
  providers: [
    ProductCreator,
    ProductFinder,
    ProductExceptionRegistry, // ← here
    { provide: PRODUCT_REPOSITORY, useClass: TypeOrmProductRepository },
  ],
  exports: [ProductExceptionRegistry],
})
export class ProductModule {}
```

The BC's shared module gathers its submodules, and it is the only piece that reaches `SharedModule`:

```typescript
// catalog/shared/infrastructure/framework/catalog-shared.module.ts
@Module({
  imports: [ProductModule, CategoryModule],
  exports: [ProductModule, CategoryModule],
})
export class CatalogSharedModule {}
```

```typescript
// shared/infrastructure/framework/shared.module.ts
@Global()
@Module({
  imports: [CatalogSharedModule, IdentitySharedModule], // ← only BC shared modules, never a submodule
  // ... providers and exports, see `api-shared`
})
export class SharedModule {}
```

`SharedModule` is `@Global()`, so `ProductExceptionRegistry` receives `GlobalExceptionRegistry` without importing `SharedModule`. A BC module never imports `SharedModule` back.

## Anti-patterns

```typescript
// ❌ Domain error with an HTTP status
export class ProductNotFound extends DomainException {
  readonly statusCode = 404; // the domain knows nothing about HTTP
}

// ❌ One registry with the errors of several submodules
globalRegistry.register(new Map([
  [ProductNotFound.name, 404],
  [OrderNotFound.name, 404],   // this belongs in order-exception-registry.ts
]));

// ❌ Try/catch in a controller to map errors
try {
  await this.creator.execute(...);
} catch (e) {
  if (e instanceof ProductNotFound) throw new NotFoundException();
}
```

## Template

File: `{bc}/{module}/infrastructure/framework/{module}-exception-registry.ts`

```typescript
import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { GlobalExceptionRegistry } from '@/shared/infrastructure/exceptions/global-exception-registry';
import { {Entity}NotFound } from '../../domain/exceptions/{entity}-not-found';
import { {Entity}AlreadyExists } from '../../domain/exceptions/{entity}-already-exists';
// Import all domain errors of this submodule

@Injectable()
export class {Module}ExceptionRegistry implements OnModuleInit {
  constructor(private readonly globalRegistry: GlobalExceptionRegistry) {}

  onModuleInit(): void {
    this.globalRegistry.register(
      new Map<string, number>([
        [{Entity}NotFound.name, HttpStatus.NOT_FOUND],
        [{Entity}AlreadyExists.name, HttpStatus.CONFLICT],
        // Add more domain errors here
      ]),
    );
  }
}
```

Register in the submodule:

```typescript
// {bc}/{module}/infrastructure/framework/{module}.module.ts
@Module({
  providers: [
    {Module}ExceptionRegistry, // ← add as provider; onModuleInit runs automatically
    // ... other providers
  ],
  exports: [{Module}ExceptionRegistry],
})
export class {Module}Module {}
```

> The registry itself implements `OnModuleInit` — NestJS calls `onModuleInit()` automatically after the module is initialized, before the first request arrives. The module class does **not** need to implement `OnModuleInit`.

## External Documentation

- [NestJS — Exception Filters](https://docs.nestjs.com/exception-filters) — `@Catch()`, `ArgumentsHost`, `HttpException`
- [NestJS — Built-in Exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions) — `NotFoundException`, `ConflictException`, etc.
