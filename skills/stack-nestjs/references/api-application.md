# api-application with NestJS

The concept skill `api-application` defines the rules. This reference shows how to apply them with NestJS.

## Rules

- A domain service can have `@Injectable()` when it needs repositories or other ports.
- All ports use `@Inject(TOKEN)` — never injection by concrete type.
- The application layer **never** imports from `@nestjs/common` (except `@Injectable` and `@Inject`).

## Use case

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
      request.summary,
      request.category,
      request.subcategory,
      request.sku,
      request.barcode,
      request.variants.map((e) => ({ ...e, productId: request.id })),
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

## Injectable domain service

```typescript
// catalog/product/domain/product-finder.ts  ← injectable domain service
// UpdateProduct, DeleteProduct, etc. all need to find the entity first
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

## Injection — name by ROLE

```typescript
// ✅
constructor(private readonly repository: ProductRepository) {}
constructor(private readonly finder: ProductFinder) {}
constructor(private readonly publisher: DomainEventPublisher) {}

// ❌
constructor(private readonly productRepository: TypeOrmProductRepository) {}
constructor(private readonly productFinderService: ProductFinderService) {}
```

## Use case template

File: `{context}/application/{verb}/{entity}-{verb}er.ts`

```typescript
import { Injectable, Inject } from '@nestjs/common';
import {
  type {Entity}Repository,
  {ENTITY}_REPOSITORY,
} from '@/{context}/domain/{entity}.repository';
import {
  type DomainEventPublisher,
  DOMAIN_EVENT_PUBLISHER,
} from '@/shared/domain/domain-event-publisher';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';
import { type AppMetrics, APP_METRICS } from '@/shared/domain/app-metrics';
import { {Entity}Id } from '@/{context}/domain/{entity}-id';
import { {Entity}NotFound } from '@/{context}/domain/exceptions/{entity}-not-found';
import { type Request{Entity}{Verb}er } from './request-{entity}-{verb}er';
import { type Response{Entity}{Verb}er } from './response-{entity}-{verb}er';

export type { Request{Entity}{Verb}er, Response{Entity}{Verb}er };

@Injectable()
export class {Entity}{Verb}er {
  constructor(
    @Inject({ENTITY}_REPOSITORY) private readonly repository: {Entity}Repository,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly publisher: DomainEventPublisher,
    @Inject(LOGGER_SERVICE) private readonly logger: Logger,
    @Inject(APP_METRICS) private readonly metrics: AppMetrics,
  ) {}

  async execute(request: Request{Entity}{Verb}er): Promise<Response{Entity}{Verb}er> {
    const {entity} = await this.repository.search(new {Entity}Id(request.id));
    if (!{entity}) throw new {Entity}NotFound(request.id);

    {entity}.{action}(/* ... */);

    await this.repository.save({entity});
    await this.publisher.publish({entity}.pullDomainEvents());

    this.logger.info('{Entity} {verb}ed', { {entity}Id: request.id });
    this.metrics.increment('app_{entities}_{verb}ed_total');

    return {entity}.toPrimitives();
  }
}
```

## External Documentation

- [NestJS — Custom Providers](https://docs.nestjs.com/fundamentals/custom-providers) — injection with `@Inject(TOKEN)`
- [NestJS — Circular Dependency](https://docs.nestjs.com/fundamentals/circular-dependency) — how to avoid circular dependencies between use cases
