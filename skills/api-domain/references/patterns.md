# Domain: patrones y ejemplos

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
  expression: string;
  meaning: string;
  category: string;
  audioStatus: string;
  createdBy: string;
};

export class Product extends AggregateRoot<ProductPrimitives> {
  public constructor(
    public readonly id: ProductId,
    private _expression: Expression,
    private _meaning: Meaning,
    private _category: Category,
    private _audioStatus: AudioStatus,
    public readonly createdBy: string,
  ) {
    super();
  }

  get expression(): Expression { return this._expression; }
  get meaning(): Meaning { return this._meaning; }
  get category(): Category { return this._category; }
  get audioStatus(): AudioStatus { return this._audioStatus; }

  // Factory para nuevas entidades — registra el domain event de creación
  static create(id: string, expression: string, meaning: string, category: string, createdBy: string): Product {
    const product = new Product(
      new ProductId(id),
      new Expression(expression),
      new Meaning(meaning),
      new Category(category),
      new AudioStatus(AudioStatusValue.Pending),
      createdBy,
    );
    product.record(new ProductCreatedEvent(product.id.value, product.toPrimitives()));
    return product;
  }

  // Factory para reconstitución desde persistencia — sin domain events
  static fromPrimitives(p: ProductPrimitives): Product {
    return new Product(
      new ProductId(p.id),
      new Expression(p.expression),
      new Meaning(p.meaning),
      new Category(p.category),
      new AudioStatus(p.audioStatus),
      p.createdBy,
    );
  }

  toPrimitives(): ProductPrimitives {
    return {
      id: this.id.value,
      expression: this.expression.value,
      meaning: this.meaning.value,
      category: this.category.value,
      audioStatus: this.audioStatus.value,
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

// shared/domain/uuid-value-object.ts — capa intermedia para IDs UUID
export abstract class UuidValueObject extends StringValueObject {
  protected static readonly UUID_REGEX = /^[0-9a-f]{8}-...-4...-[89ab]...-...$/i;

  static isValid(value: string): boolean { return UuidValueObject.UUID_REGEX.test(value); }
  static random(): string { return randomUUID(); }
}
```

```typescript
// shared/domain/product-id.ts  ← los IDs globales van en shared/domain/
import { UuidValueObject } from '@/shared/domain/uuid-value-object';
import { ProductIdInvalid } from '@/shared/domain/exceptions/product-id-invalid';

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
// catalog/product/domain/expression.ts  ← VOs propios del BC en su domain/
import { StringValueObject } from '@/shared/domain/string-value-object';

export class Expression extends StringValueObject {
  private static readonly MAX_LENGTH = 200;

  constructor(value: string) {
    super(value);
    if (!value?.trim()) throw new ExpressionEmpty();
    if (value.length > Expression.MAX_LENGTH) throw new ExpressionTooLong();
  }
}
```

### Repository Interface

```typescript
// catalog/product/domain/product.repository.ts
import { type Criteria } from '@/shared/domain/criteria';
import { type Product } from './product';
import { type ProductId } from '@/shared/domain/product-id';

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
import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class ProductNotFound extends DomainException {
  constructor() {
    super(`Product not found`);
  }
}
```

## Anti-patterns

```typescript
// ❌ Decoradores de framework en domain
@Entity() export class Product {}

// ❌ Sufijo en value object
export class ProductIdVO {}

// ❌ ID que extiende StringValueObject en lugar de UuidValueObject
export class ProductId extends StringValueObject { /* mal */ }

// ❌ Validación de UUID como empty-check en lugar de formato
export class ProductId extends UuidValueObject {
  constructor(value: string) {
    super(value);
    if (!value?.trim()) throw new ProductIdEmpty(); // mal — no valida UUID
  }
}

// ❌ DomainError en lugar de DomainException
export class ProductNotFound extends DomainError {} // DomainError no existe

// ❌ Métodos ad-hoc en repositorio que pueden resolverse con criteria
interface ProductRepository {
  findByExpression(expr: string): Promise<Product[]>; // usar match(criteria)
}

// ❌ Lógica de negocio fuera del aggregate
async execute(expression: string): Promise<void> {
  if (expression.length > 200) throw new Error('too long'); // esto va en el VO
}

// ❌ fromPrimitives para crear entidades nuevas (sin eventos)
const product = Product.fromPrimitives({ id, expression, ... }); // usar create()
```
