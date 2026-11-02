# TypeORM — docs/engineering/engineering-principles.md

TypeORM details for the concepts in `docs/engineering/engineering-principles.md`.

## Liskov Substitution

`TypeOrmProductRepository` and `InMemoryProductRepository` are interchangeable. Tests use the in-memory version; production uses TypeORM. The use case does not notice the difference.

## Dependency Inversion

The use case depends on `ProductRepository` (abstraction), not on `TypeOrmProductRepository` (implementation).

```ts
// ❌ Violates DIP: instantiates the concrete dependency
class ProductCreator {
  private repository = new TypeOrmProductRepository();
}

// ✅ Correct: receives the abstraction through the constructor
class ProductCreator {
  constructor(private readonly repository: ProductRepository) {}
}
```
