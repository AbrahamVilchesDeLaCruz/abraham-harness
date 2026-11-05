# Repository contract

## Port and adapter boundary

```text
Use case / domain service
        │ domain port (aggregate + query intent)
        ▼
Infrastructure adapter ── maps ── persistence entity / database
```

The port speaks the bounded context's domain language. It does not expose ORM entities, query builders, connection objects, SQL operators or framework decorators. The adapter translates persistence results to domain objects and keeps the reverse mapping private.

## Default aggregate contract

```typescript
export interface ProductRepository {
  save(product: Product): Promise<void>;
  search(id: ProductId): Promise<Product | null>;
  match(criteria: Criteria): Promise<Product[]>;
  remove(id: ProductId): Promise<void>;
}

export const PRODUCT_REPOSITORY = Symbol('ProductRepository');
```

| Method | Meaning |
|---|---|
| `save(aggregate)` | Persist new or changed aggregate state |
| `search(id)` | Find one aggregate by identity; return `null` when absent |
| `match(criteria)` | Find aggregates by the shared query model, including its filters/order/page |
| `count(criteria)` | Count matching records without loading them; add only when the caller needs a total |
| `remove(id)` | Remove by aggregate identity when the domain capability permits it |

Do not create `searchByStatus`, `searchByUserIdAndStatus`, or methods named after each UI filter. Put query construction in the use case/domain service using `api-criteria`; translate its semantics in the adapter.

## Extending the port

Before adding a method, name the caller and the capability it needs. Prefer a domain operation or an explicit query result when the requirement differs from aggregate lookup. Add a batch operation only when the use case has a genuine batch write and its atomicity/partial-failure semantics are defined. Do not weaken `match` semantics to work around a missing adapter capability; implement and test the translation in that adapter.

Application tests mock the domain port. Adapter tests exercise mapping and persistence behavior through the adapter boundary. Keep both test styles aligned with `api-testing` and the project's stack skill.
