# Use Case Spec Patterns — Reference

## Canonical use case test pattern

Use cases are instantiated directly with `new` in `beforeEach` — no DI container is used in tests.
Imports from src use the `@/` alias; imports from test use `@test/`.

This version omits the mock library import and the fake-timers helper. The original is in the testing stack skill, in `references/api-testing.md`. Freeze the clock in `beforeEach` and restore it in `afterEach` only when the aggregate or event depends on `new Date()`.

```typescript
// apps/api/test/catalog/product/application/create/product-creator.spec.ts
import { type ProductRepository } from '@/catalog/product/domain/product.repository.js';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher.js';
import { ProductCreator } from '@/catalog/product/application/create/product-creator.js';
import { ProductCreatedEvent } from '@/catalog/product/domain/events/product-created.event.js';
import { ProductMother } from '@test/shared/product/product-mother.js';
import { RequestProductCreatorMother } from './request-product-creator.mother.js';

describe('catalog/product/application/create ProductCreator', () => {
  const repository = createMock<ProductRepository>();
  const publisher = createMock<DomainEventPublisher>();
  let creator: ProductCreator;

  beforeEach(() => {
    resetMock(repository.save);
    resetMock(publisher.publish);
    resolveWith(publisher.publish, undefined);

    creator = new ProductCreator(repository, publisher);
  });

  it('should save the product and publish the created event', async () => {
    const request = RequestProductCreatorMother.random();
    const expected = ProductMother.from(request);

    await creator.execute(request);

    expect(repository.save).toHaveBeenCalledWith(expected);
    expect(firstCallArgs(publisher.publish)[0][0]).toBeInstanceOf(ProductCreatedEvent);
  });

  it('should not save nor publish when name is empty', async () => {
    const request = RequestProductCreatorMother.random({ name: '' });

    await expect(creator.execute(request)).rejects.toThrow(ProductNameEmpty);

    expect(repository.save).not.toHaveBeenCalled();
    expect(publisher.publish).not.toHaveBeenCalled();
  });
});
```

## Object Mothers

`MotherCreator` (root) wraps the test-data library, and primitive Mothers (`StringMother`, `UuidMother`) build on it. Both depend on that library, so they are in the testing stack skill.

> **Note**: There is no `NumberMother` in the project. Use the test-data library directly in domain Mothers when a number is needed, or add a specific method to the aggregate's Mother.

### Value Object Mother

```typescript
// apps/api/test/shared/product/product-id-mother.ts
import { UuidMother } from '@test/shared/domain/uuid-mother.js';
import { ProductId } from '@/catalog/product/domain/product-id.js';

export class ProductIdMother {
  static random(): ProductId {
    return new ProductId(UuidMother.random());
  }

  static invalid(): string {
    return 'not-a-uuid';
  }
}
```

### Aggregate Mother

```typescript
// apps/api/test/shared/product/product-mother.ts
import { type RequestProductCreator } from '@/catalog/product/application/create/product-creator.js';
import { Product } from '@/catalog/product/domain/product.js';
import { ProductIdMother } from './product-id-mother.js';
import { StringMother } from '@test/shared/domain/string-mother.js';

export class ProductMother {
  static create(id: string, name: string, description: string): Product {
    return Product.fromPrimitives({ id, name, description });
  }

  static from(request: RequestProductCreator): Product {
    return this.create(request.id, request.name, request.description);
  }

  static random(overrides?: Partial<{ id: string; name: string; description: string }>): Product {
    return this.create(
      overrides?.id ?? ProductIdMother.random().value,
      overrides?.name ?? StringMother.sentence(),
      overrides?.description ?? StringMother.sentence(),
    );
  }
}
```

### Request Mother

```typescript
// apps/api/test/catalog/product/application/create/request-product-creator.mother.ts
import { type RequestProductCreator } from '@/catalog/product/application/create/product-creator.js';
import { UuidMother } from '@test/shared/domain/uuid-mother.js';
import { StringMother } from '@test/shared/domain/string-mother.js';

export class RequestProductCreatorMother {
  static random(overrides?: Partial<RequestProductCreator>): RequestProductCreator {
    return {
      id: overrides?.id ?? UuidMother.random(),
      name: overrides?.name ?? StringMother.sentence(),
      description: overrides?.description ?? StringMother.sentence(),
    };
  }
}
```

## Mocks

Use a typed mock of the port (`createMock<ProductRepository>()`). Do NOT use an untyped object of mock functions.

## Describe naming

```typescript
describe('{bc}/{module}/application/{action} {ClassName}', () => {
  describe('when {scenario}', () => {
    it('should {expected behavior}', async () => { ... });
  });
});

// Real example
describe('sales/order/application/complete OrderCompleter', () => {
  it('should complete an order', async () => { ... });
  it('should throw OrderNotFound when order does not exist', async () => { ... });
});
```

## E2E tests

E2E tests live in `test/{bc}/infrastructure/` and drive the real HTTP server with `createTestApp()`.

`createTestApp()` lives in `test/shared/infrastructure/create-test-app.ts` and:
- Starts the real application module
- Replaces external services (AI, image) with stubs
- Replaces `DomainEventPublisher` with `E2eDomainEventPublisher`
- Applies the validation pipeline, cookie parsing and the global `v1` prefix
