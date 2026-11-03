# api-testing with Vitest, vitest-mock-extended and Faker

Apply the rules of `api-testing`. This reference shows the Vitest implementation.

## Rules

- **Rule**: faker lives only in `MotherCreator`. Never import faker directly in a domain Mother.
- Reset only the methods the test uses (`.mockReset()`).
- Use `FakeTimers.setup()` / `FakeTimers.teardown()` (from `@test/shared/fake-timers.js`) when the aggregate or event depends on `new Date()`.
- No `vi.fn()` for typed ports.
- Create mocks with `mock<ProductRepository>()`, from `vitest-mock-extended`. Add it, and `@faker-js/faker`, as dev dependencies: the NestJS template brings neither.
- `describe`, `it`, `expect`, `beforeEach` and `vi` are globals, because the template sets `globals: true` and lists `vitest/globals` in `tsconfig.json`. Do not import them.
- The template is ESM, so imports of project files end in `.js`, also through the `@/` and `@test/` aliases.

## Canonical use case test

```typescript
// apps/api/test/catalog/product/application/create/product-creator.spec.ts
import { mock } from 'vitest-mock-extended';
import { type ProductRepository } from '@/catalog/product/domain/product.repository.js';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher.js';
import { ProductCreator } from '@/catalog/product/application/create/product-creator.js';
import { ProductCreatedEvent } from '@/catalog/product/domain/events/product-created.event.js';
import { ProductNameEmpty } from '@/catalog/product/domain/exceptions/product-name-empty.js';
import { ProductMother } from '@test/shared/product/product-mother.js';
import { FakeTimers } from '@test/shared/fake-timers.js';
import { RequestProductCreatorMother } from './request-product-creator.mother.js';

describe('catalog/product/application/create ProductCreator', () => {
  const repository = mock<ProductRepository>();
  const publisher = mock<DomainEventPublisher>();
  let creator: ProductCreator;

  beforeEach(() => {
    FakeTimers.setup();
    repository.save.mockReset();
    publisher.publish.mockReset();
    publisher.publish.mockResolvedValue(undefined);

    creator = new ProductCreator(repository, publisher);
  });

  afterEach(() => FakeTimers.teardown());

  it('should save the product and publish the created event', async () => {
    const request = RequestProductCreatorMother.random();
    const expected = ProductMother.from(request);

    await creator.execute(request);

    expect(repository.save).toHaveBeenCalledWith(expected);
    expect(publisher.publish.mock.calls[0][0][0]).toBeInstanceOf(ProductCreatedEvent);
  });

  it('should not save nor publish when name is empty', async () => {
    const request = RequestProductCreatorMother.random({ name: '' });

    await expect(creator.execute(request)).rejects.toThrow(ProductNameEmpty);

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
import { MotherCreator } from './mother-creator.js';

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
```

```typescript
// apps/api/test/shared/domain/uuid-mother.ts
import { MotherCreator } from './mother-creator.js';

export class UuidMother {
  static random(): string { return MotherCreator.random().string.uuid(); }
}
```

> **Note**: There is no `NumberMother` in the project. Use `faker.number.int(...)` directly in domain Mothers when a number is needed, or add a specific method to the aggregate's Mother.

## `FakeTimers` helper

```typescript
// apps/api/test/shared/fake-timers.ts
const FIXED_DATE = new Date('2026-01-01T12:00:00Z');

export class FakeTimers {
  static setup(date: Date = FIXED_DATE): void {
    vi.useFakeTimers().setSystemTime(date);
  }

  static teardown(): void {
    vi.useRealTimers();
  }
}
```

Use it only when the aggregate or event depends on `new Date()`:

```typescript
beforeEach(() => {
  FakeTimers.setup();
  // ...
});

afterEach(() => FakeTimers.teardown());
```

## Mocks with vitest-mock-extended

```typescript
const repository = mock<ProductRepository>();
repository.save.mockResolvedValueOnce(undefined);
expect(repository.save).toHaveBeenCalledWith(expected);

// ❌ Instead, do NOT do this:
const repository = { save: vi.fn(), search: vi.fn() }; // untyped
```

## Mocking a module

Ports cover almost every case. When an infrastructure test must replace a third-party module, use `vi.mock`, which is hoisted above the imports, and `vi.mocked` for the types. `vi.importActual` is async, so the factory is async too.

```typescript
import { randomUUID } from 'node:crypto';
import type * as NodeCrypto from 'node:crypto';

vi.mock('node:crypto', async () => ({
  ...(await vi.importActual<typeof NodeCrypto>('node:crypto')),
  randomUUID: vi.fn(),
}));

it('should use the generated id', () => {
  vi.mocked(randomUUID).mockReturnValue('00000000-0000-4000-8000-000000000000');

  expect(randomUUID()).toBe('00000000-0000-4000-8000-000000000000');
});
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

// ❌ vi.fn() for typed ports
const repository = { save: vi.fn(), search: vi.fn() };
```

## External Documentation

- [Vitest — Guide](https://vitest.dev/guide/) — test runner and assertions
- [vitest-mock-extended](https://github.com/eratio08/vitest-mock-extended) — `mock<T>()` for TypeScript interfaces
- [Faker.js — Docs](https://fakerjs.dev/api/) — test data generation (used in `MotherCreator`)
- [Vitest — Mocking timers](https://vitest.dev/guide/mocking/timers) — `vi.useFakeTimers()` to control `new Date()`
- [Vitest — Mock Functions](https://vitest.dev/api/mock) — `mockResolvedValueOnce`, `mockReset`

The concept skill uses the neutral name `createMock<T>()` for `mock<T>()` from vitest-mock-extended.

The concept skill also uses neutral helpers: `resetMock(fn)` is `fn.mockReset()`, `resolveWith(fn, value)` is `fn.mockResolvedValue(value)`, and `firstCallArgs(fn)` is `fn.mock.calls[0]`.
