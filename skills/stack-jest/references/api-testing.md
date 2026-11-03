# api-testing with Jest, jest-mock-extended and Faker

Apply the rules of `api-testing`. This reference shows the Jest implementation.

## Rules

- **Rule**: faker lives only in `MotherCreator`. Never import faker directly in a domain Mother.
- Reset only the methods the test uses (`.mockReset()`).
- Use `JestTimers.setup()` / `JestTimers.teardown()` (from `@test/shared/jest-timers`) when the aggregate or event depends on `new Date()`.
- No `jest.fn()` for typed ports.
- Create mocks with `mock<ProductRepository>()`, from `jest-mock-extended`.

## Canonical use case test

```typescript
// apps/api/test/catalog/product/application/create/product-creator.spec.ts
import { mock } from 'jest-mock-extended';
import { type ProductRepository } from '@/catalog/product/domain/product.repository';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { ProductCreator } from '@/catalog/product/application/create/product-creator';
import { ProductCreatedEvent } from '@/catalog/product/domain/events/product-created.event';
import { ProductMother } from '@test/shared/product/product-mother';
import { RequestProductCreatorMother } from './request-product-creator.mother';
import { JestTimers } from '@test/shared/jest-timers';

describe('catalog/product/application/create ProductCreator', () => {
  const repository = mock<ProductRepository>();
  const publisher = mock<DomainEventPublisher>();
  let creator: ProductCreator;

  beforeEach(() => {
    JestTimers.setup();
    repository.save.mockReset();
    publisher.publish.mockReset();
    publisher.publish.mockResolvedValue(undefined);

    creator = new ProductCreator(repository, publisher);
  });

  afterEach(() => JestTimers.teardown());

  it('should save the product and publish the created event', async () => {
    const request = RequestProductCreatorMother.random();
    const expected = ProductMother.from(request);

    await creator.execute(request.name, request.description);

    expect(repository.save).toHaveBeenCalledWith(expected);
    expect(publisher.publish.mock.calls[0][0][0]).toBeInstanceOf(ProductCreatedEvent);
  });

  it('should not save nor publish when name is empty', async () => {
    await expect(creator.execute('', 'description')).rejects.toThrow(ProductNameEmpty);

    expect(repository.save).not.toHaveBeenCalled();
    expect(publisher.publish).not.toHaveBeenCalled();
  });
});
```

## `MotherCreator` (root)

`MotherCreator` is shared and already exists — do not recreate it.

```typescript
// apps/api/test/shared/domain/mother-creator.ts
import { faker, type Faker } from '@faker-js/faker';

export class MotherCreator {
  static random(): Faker {
    return faker;
  }
}
```

## Primitive Mothers

```typescript
// apps/api/test/shared/domain/string-mother.ts
export class StringMother {
  static random(): string { return MotherCreator.random().lorem.word(); }
  static sentence(): string { return MotherCreator.random().lorem.sentence(); }
  static ofLength(length: number): string {
    return MotherCreator.random().string.alpha({ length });
  }
  static email(): string {
    return MotherCreator.random().internet.email().toLowerCase();
  }
  static alphanumeric(length: number): string {
    return MotherCreator.random().string.alphanumeric({ length });
  }
  static ip(): string {
    return MotherCreator.random().internet.ipv4();
  }
}

// apps/api/test/shared/domain/uuid-mother.ts
export class UuidMother {
  static random(): string { return MotherCreator.random().string.uuid(); }
}
```

> **Note**: There is no `NumberMother` in the project. Use `faker.number.int(...)` directly in domain Mothers when a number is needed, or add a specific method to the aggregate's Mother.

## `JestTimers` helper

```typescript
// apps/api/test/shared/jest-timers.ts
import { jest } from '@jest/globals';

const FIXED_DATE = new Date('2026-01-01T12:00:00Z');

export class JestTimers {
  static setup(date: Date = FIXED_DATE): void {
    jest.useFakeTimers().setSystemTime(date);
  }

  static teardown(): void {
    jest.useRealTimers();
  }
}
```

Use it only when the aggregate or event depends on `new Date()`:

```typescript
beforeEach(() => {
  JestTimers.setup();
  // ...
});

afterEach(() => JestTimers.teardown());
```

Shared timers helper:

```
apps/api/test/shared/jest-timers.ts   ← JestTimers.setup() / teardown()
```

## Mocks with jest-mock-extended

```typescript
const repository = mock<ProductRepository>();
repository.save.mockResolvedValueOnce(undefined);
expect(repository.save).toHaveBeenCalledWith(expected);

// ❌ Instead, do NOT do this:
const repository = { save: jest.fn(), search: jest.fn() }; // untyped
```

## Anti-patterns

```typescript
// ❌ Concrete adapter in an application test
const repository = new TypeOrmProductRepository(dataSource);

// ❌ State shared between tests
let sharedProduct: Product; // outside beforeEach

// ❌ Magic string when a Mother exists
const product = Product.fromPrimitives({ id: "123", name: "test", description: "test" });

// ❌ Inline Mother in the spec
const mother = { id: uuid(), name: faker.lorem.word() };

// ❌ jest.fn() for typed ports
const repository = { save: jest.fn(), search: jest.fn() };
```

## External Documentation

- [Jest — Docs](https://jestjs.io/docs/getting-started) — test runner and assertions
- [jest-mock-extended](https://github.com/marchaos/jest-mock-extended) — `mock<T>()` for TypeScript interfaces
- [Faker.js — Docs](https://fakerjs.dev/api/) — test data generation (used in `MotherCreator`)
- [Jest — Fake Timers](https://jestjs.io/docs/timer-mocks) — `jest.useFakeTimers()` to control `new Date()`
- [Jest — Mock Functions](https://jestjs.io/docs/mock-functions) — `mockResolvedValueOnce`, `mockReset`

The concept skill uses the neutral name `createMock<T>()` for `mock<T>()` from jest-mock-extended.

The concept skill also uses neutral helpers: `resetMock(fn)` is `fn.mockReset()`, `resolveWith(fn, value)` is `fn.mockResolvedValue(value)`, and `firstCallArgs(fn)` is `fn.mock.calls[0]`.
