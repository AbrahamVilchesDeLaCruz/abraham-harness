# Application: patterns and examples

The versions with framework markers live in the project's stack skill, in `references/api-application.md`.

### Use Cases

```typescript
// catalog/product/application/create/product-creator.ts
export class ProductCreator {
  constructor(
    private readonly repository: ProductRepository,
    private readonly publisher: DomainEventPublisher,
    private readonly logger: Logger,
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

Re-export `Request*` and `Response*` in the same file as the use case:

```typescript
// order-completer.ts — at the top of the file, after the imports
export type { RequestOrderCompleter, ResponseOrderCompleter };
```

**Request\* — input type:**

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
  examples: { id: string; textEn: string; description: string; position: number }[];
  createdBy: string;
};
```

**`Response*` — output type when it returns complex data:**

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

When the **same domain logic** is needed in several use cases, extract it to a Domain Service in `domain/`. The criterion is not I/O vs no-I/O — it is reuse across use cases.

```typescript
// sales/domain/guest-order-policy.ts  ← pure policy: several use cases query it
export class GuestOrderPolicy {
  static readonly MAX_CARD_COUNT_FOR_GUEST = 10;

  static assertCanStartNewOrder(todayOrderCount: number): void {
    if (todayOrderCount >= 3) throw new GuestOrderLimitReached();
  }
}
```

```typescript
// catalog/product/domain/product-finder.ts  ← injectable domain service
// UpdateProduct, DeleteProduct, etc. all need to find the entity first
export class ProductFinder {
  constructor(
    private readonly repository: ProductRepository,
  ) {}

  async findOrFail(id: ProductId): Promise<Product> {
    const product = await this.repository.search(id);
    if (!product) throw new ProductNotFound(id.value);
    return product;
  }
}
```

### Injection — name by ROLE

```typescript
// ✅
constructor(private readonly repository: ProductRepository) {}
constructor(private readonly finder: ProductFinder) {}
constructor(private readonly publisher: DomainEventPublisher) {}

// ❌
constructor(private readonly productFinderService: ProductFinderService) {}
```

An injected variable is typed with the port, never with the concrete adapter class.

## Anti-patterns

```typescript
// ❌ Loose primitives as parameters
async execute(name: string, meaning: string, category: string): Promise<void> {}
// ✅ Request type object
async execute(request: RequestProductCreator): Promise<void> {}

// ❌ DTO class with decorators in application
export class CreateProductDto { name: string; meaning: string; }

// ❌ Business logic in a use case
async execute(request): Promise<void> {
  if (request.name.length > 500) throw new Error('too long'); // belongs in a value object or entity
}

// ❌ Returning a domain entity
async execute(id: string): Promise<Product> { ... } // return primitives

// ❌ Injection name repeats the class
constructor(private readonly productCreator: ProductCreator) {}

// ❌ Service suffix on a domain service
export class ProductFinderService {} // ProductFinder
```
