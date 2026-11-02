# Application: patrones y ejemplos

### Use Cases

```typescript
// catalog/product/application/create/product-creator.ts
@Injectable()
export class ProductCreator {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly repository: ProductRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
    @Inject(APP_METRICS)
    private readonly metrics: AppMetrics,
  ) {}

  async execute(request: RequestProductCreator): Promise<ProductPrimitives> {
    const product = Product.create(
      request.id,
      request.name,
      request.meaning,
      request.category,
      request.subcategory,
      request.ipaNotation,
      request.nativeSpeech,
      request.examples.map((e) => ({ ...e, productId: request.id })),
      request.createdBy,
    );

    await this.repository.save(product);
    await this.publisher.publish(product.pullDomainEvents());

    this.logger.info("Product created", {
      productId: request.id,
      name: request.name,
    });

    this.metrics.increment("app_products_created_total");

    return product.toPrimitives();
  }
}
```

Re-exportar `Request*` y `Response*` en el mismo archivo del use case:

```typescript
// order-completer.ts — al inicio del archivo, tras los imports
export type { RequestOrderCompleter, ResponseOrderCompleter };
```

**Request\* — tipo del input:**

```typescript
// catalog/product/application/create/request-product-creator.ts
export type RequestProductCreator = {
  id: string;
  name: string;
  meaning: string;
  category: string;
  subcategory: string;
  ipaNotation: string | null;
  nativeSpeech: string | null;
  examples: { id: string; textEn: string; textEs: string; position: number }[];
  createdBy: string;
};
```

**`Response*` — tipo del output cuando devuelve datos complejos:**

```typescript
// sales/application/complete/response-order-completer.ts
export type ResponseOrderCompleter = {
  correctCount: number;
  totalCount: number;
  accuracy: number;
  duration: number;
  cardsViewed: number;
};
```

### Domain Services

Cuando la **misma lógica de dominio** es necesaria en varios use cases, se extrae a un Domain Service en `domain/`. El criterio no es I/O vs no-I/O — es reutilización entre use cases.

```typescript
// sales/domain/guest-order-policy.ts  ← política pura: varios UCs la consultan
export class GuestOrderPolicy {
  static readonly MAX_CARD_COUNT_FOR_GUEST = 10;

  static assertCanStartNewOrder(todayOrderCount: number): void {
    if (todayOrderCount >= 3) throw new GuestOrderLimitReached();
  }
}
```

```typescript
// catalog/product/domain/product-finder.ts  ← domain service inyectable
// UpdateProduct, DeleteProduct, etc. todos necesitan primero encontrar la entidad
@Injectable()
export class ProductFinder {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly repository: ProductRepository,
  ) {}

  async findOrFail(id: ProductId): Promise<Product> {
    const product = await this.repository.search(id);
    if (!product) throw new ProductNotFound(id.value);
    return product;
  }
}
```

### Inyección — nombre por ROL

```typescript
// ✅
constructor(private readonly repository: ProductRepository) {}
constructor(private readonly finder: ProductFinder) {}
constructor(private readonly publisher: DomainEventPublisher) {}

// ❌
constructor(private readonly productRepository: TypeOrmProductRepository) {}
constructor(private readonly productFinderService: ProductFinderService) {}
```

## Anti-patterns

```typescript
// ❌ Primitivos sueltos como parámetros
async execute(name: string, meaning: string, category: string): Promise<void> {}
// ✅ Request type object
async execute(request: RequestProductCreator): Promise<void> {}

// ❌ Clase DTO con decoradores en application
export class CreateProductDto { name: string; meaning: string; }

// ❌ Lógica de negocio en use case
async execute(request): Promise<void> {
  if (request.expression.length > 500) throw new Error('too long'); // va en VO o entidad
}

// ❌ Retornar entidad de dominio
async execute(id: string): Promise<Product> { ... } // retornar primitivos

// ❌ Nombre de inyección repite la clase
constructor(private readonly productCreator: ProductCreator) {}

// ❌ Sufijo Service en domain service
export class ProductFinderService {} // ProductFinder
```
