# Error handling: patrones y ejemplos

### Arquitectura del sistema de errores

```
shared/infrastructure/exceptions/
├── global-exception-registry.ts   ← registro global (Map<exceptionName, HttpStatus>)
└── http-exception.filter.ts       ← @Catch() — aplica el registry

{feature}/infrastructure/framework/
└── {feature}-exception-registry.ts  ← registra los errores del módulo en onModuleInit()
```

### GlobalExceptionRegistry — shared

```typescript
// shared/infrastructure/exceptions/global-exception-registry.ts
@Injectable()
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

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';
    let errorType: string | null = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (exception instanceof Error) {
      const registered = this.registry.getStatusCode(exception.constructor.name);
      if (registered !== undefined) status = registered;
      message = exception.message;
      errorType = exception.constructor.name;
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

### Exception Registry por módulo

```typescript
// products/infrastructure/framework/product-exception-registry.ts
@Injectable()
export class ProductExceptionRegistry implements OnModuleInit {
  constructor(private readonly globalRegistry: GlobalExceptionRegistry) {}

  onModuleInit() {
    this.globalRegistry.register(
      new Map<string, number>([
        [ProductNotFound.name, HttpStatus.NOT_FOUND],
        [ProductFrontEmpty.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [ProductAlreadyExists.name, HttpStatus.CONFLICT],
      ]),
    );
  }
}
```

Registrarlo como provider en el módulo:

```typescript
// products/infrastructure/framework/product.module.ts
@Module({
  providers: [
    ProductCreator,
    ProductFinder,
    ProductExceptionRegistry, // ← aquí
    { provide: PRODUCT_REPOSITORY, useClass: TypeOrmProductRepository },
  ],
})
export class ProductModule {}
```

## Anti-patterns

```typescript
// ❌ Domain error con HTTP status
export class ProductNotFound extends DomainException {
  readonly statusCode = 404; // el dominio no sabe de HTTP
}

// ❌ Registry global con todos los errores de todos los módulos
globalRegistry.register(new Map([
  [ProductNotFound.name, 404],
  [OrderNotFound.name, 404],   // esto va en order-exception-registry.ts
]));

// ❌ Try/catch en controller para mapear errores
try {
  await this.creator.execute(...);
} catch (e) {
  if (e instanceof ProductNotFound) throw new NotFoundException();
}
```
