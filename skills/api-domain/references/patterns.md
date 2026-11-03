# Domain: patterns and examples

### Aggregate Root

```typescript
// shared/domain/aggregate-root.ts
export abstract class AggregateRoot<Primitives> {
  private domainEvents: DomainEvent[] = [];

  abstract toPrimitives(): Primitives;

  protected record(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
  }
}
```

```typescript
// catalog/product/domain/product.ts
export type ProductPrimitives = {
  id: string;
  name: string;
  summary: string;
  category: string;
  stockStatus: string;
  createdBy: string;
};

export class Product extends AggregateRoot<ProductPrimitives> {
  public constructor(
    public readonly id: ProductId,
    private _name: ProductName,
    private _summary: Summary,
    private _category: Category,
    private _stockStatus: StockStatus,
    public readonly createdBy: string,
  ) {
    super();
  }

  get name(): ProductName { return this._name; }
  get summary(): Summary { return this._summary; }
  get category(): Category { return this._category; }
  get stockStatus(): StockStatus { return this._stockStatus; }

  // Factory for new entities — records the creation domain event
  static create(id: string, name: string, summary: string, category: string, createdBy: string): Product {
    const product = new Product(
      new ProductId(id),
      new ProductName(name),
      new Summary(summary),
      new Category(category),
      new StockStatus(StockStatusValue.Pending),
      createdBy,
    );
    product.record(new ProductCreatedEvent(product.id.value, product.toPrimitives()));
    return product;
  }

  // Factory for reconstitution from persistence — no domain events
  static fromPrimitives(p: ProductPrimitives): Product {
    return new Product(
      new ProductId(p.id),
      new ProductName(p.name),
      new Summary(p.summary),
      new Category(p.category),
      new StockStatus(p.stockStatus),
      p.createdBy,
    );
  }

  toPrimitives(): ProductPrimitives {
    return {
      id: this.id.value,
      name: this.name.value,
      summary: this.summary.value,
      category: this.category.value,
      stockStatus: this.stockStatus.value,
      createdBy: this.createdBy,
    };
  }
}
```

### Value Objects

```typescript
// shared/domain/value-object.ts
export abstract class ValueObject<T> {
  constructor(readonly value: T) {}

  equals(other: ValueObject<T>): boolean {
    return this.value === other.value;
  }
}

// shared/domain/string-value-object.ts
export abstract class StringValueObject extends ValueObject<string> {}

// shared/domain/uuid-value-object.ts — intermediate layer for UUID IDs
export abstract class UuidValueObject extends StringValueObject {
  protected static readonly UUID_REGEX = /^[0-9a-f]{8}-...-4...-[89ab]...-...$/i;

  static isValid(value: string): boolean { return UuidValueObject.UUID_REGEX.test(value); }
  static random(): string { return randomUUID(); }
}
```

```typescript
// shared/domain/product-id.ts  ← global IDs go in shared/domain/
import { UuidValueObject } from '@/shared/domain/uuid-value-object.js';
import { ProductIdInvalid } from '@/shared/domain/exceptions/product-id-invalid.js';

export class ProductId extends UuidValueObject {
  constructor(value: string) {
    if (!UuidValueObject.isValid(value)) throw new ProductIdInvalid(value);
    super(value);
  }

  static generate(): ProductId {
    return new ProductId(UuidValueObject.random());
  }
}
```

```typescript
// catalog/product/domain/product-name.ts  ← value objects owned by the BC go in its domain/
import { StringValueObject } from '@/shared/domain/string-value-object.js';

export class ProductName extends StringValueObject {
  private static readonly MAX_LENGTH = 200;

  constructor(value: string) {
    super(value);
    if (!value?.trim()) throw new ProductNameEmpty();
    if (value.length > ProductName.MAX_LENGTH) throw new ProductNameTooLong();
  }
}
```

### Repository Interface

```typescript
// catalog/product/domain/product.repository.ts
import { type Criteria } from '@/shared/domain/criteria.js';
import { type Product } from './product.js';
import { type ProductId } from '@/shared/domain/product-id.js';

export interface ProductRepository {
  match(criteria: Criteria): Promise<Product[]>;
  count(criteria: Criteria): Promise<number>;
  search(id: ProductId): Promise<Product | null>;
  save(product: Product): Promise<void>;
  saveAll(products: Product[]): Promise<void>;
  remove(id: ProductId): Promise<void>;
}

export const PRODUCT_REPOSITORY = Symbol('ProductRepository');
```

### Domain Errors

```typescript
// shared/domain/exceptions/domain-exception.ts
export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// catalog/product/domain/exceptions/product-not-found.ts
import { DomainException } from '@/shared/domain/exceptions/domain-exception.js';

export class ProductNotFound extends DomainException {
  constructor() {
    super(`Product not found`);
  }
}
```

## Anti-patterns

Framework decorators in domain are forbidden; the project's stack skills show the concrete case.

```typescript

// ❌ Suffix on a value object
export class ProductIdVO {}

// ❌ ID that extends StringValueObject instead of UuidValueObject
export class ProductId extends StringValueObject { /* wrong */ }

// ❌ UUID validation as an empty-check instead of a format check
export class ProductId extends UuidValueObject {
  constructor(value: string) {
    super(value);
    if (!value?.trim()) throw new ProductIdEmpty(); // wrong — does not validate the UUID
  }
}

// ❌ DomainError instead of DomainException
export class ProductNotFound extends DomainError {} // DomainError does not exist

// ❌ Ad-hoc repository methods that can be solved with criteria
interface ProductRepository {
  findByExpression(expr: string): Promise<Product[]>; // use match(criteria)
}

// ❌ Business logic outside the aggregate
async execute(name: string): Promise<void> {
  if (name.length > 200) throw new Error('too long'); // this belongs in the value object
}

// ❌ fromPrimitives to create new entities (no events)
const product = Product.fromPrimitives({ id, name, ... }); // use create()
```
