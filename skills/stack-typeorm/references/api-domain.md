# api-domain with TypeORM

The concept skill `api-domain` defines the rules.

- An aggregate root carries no NestJS or TypeORM decorators.
- See `api-infrastructure` for TypeORM Entity vs. Aggregate, and how to keep persistence separate.

## Anti-patterns

```typescript
// ❌ Framework decorators in domain
@Entity() export class Product {}

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
