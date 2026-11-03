# Criteria: patterns and examples

## `Criteria` structure

```typescript
// shared/domain/criteria.ts
export class Criteria {
  constructor(
    readonly filters: Filter[] = [],
    readonly order: Order | null = null,
    readonly page: number | null = null,
    readonly pageSize: number | null = null,
  ) {}
}

export enum FilterOperator {
  EQ = '=', NEQ = '!=',
  GT = '>', LT = '<', GTE = '>=', LTE = '<=',
  LIKE = 'LIKE', IN = 'IN',
}

export enum OrderDirection { ASC = 'ASC', DESC = 'DESC' }

export type Filter = { field: string; operator: FilterOperator; value: unknown; };
export type Order  = { field: string; direction: OrderDirection; };
```

## Construction — always `new Criteria([...])`

```typescript
// Criteria with filters, order and pagination
const criteria = new Criteria(
  [
    { field: 'userId', operator: FilterOperator.EQ, value: userId },
    { field: 'status', operator: FilterOperator.EQ, value: 'active' },
    { field: 'startedAt', operator: FilterOperator.GTE, value: today },
  ],
  { field: 'startedAt', direction: OrderDirection.DESC },
  1,   // page
  20,  // pageSize
);

// value: null → IS NULL / IS NOT NULL (the repository translates it)
const criteria = new Criteria([
  { field: 'finishedAt', operator: FilterOperator.EQ, value: null },  // IS NULL
]);
```

## Optional filters — conditional construction

When not all filters are required, build the array dynamically:

```typescript
const filters: Filter[] = [];

if (request.category)
  filters.push({ field: 'category', operator: FilterOperator.EQ, value: request.category });
if (request.subcategory)
  filters.push({ field: 'subcategory', operator: FilterOperator.EQ, value: request.subcategory });

const criteria = new Criteria(filters, null, page, pageSize);
```

## Pagination with `page`/`pageSize` and `count()`

The client sends `page` + `pageSize`. The use case passes them to `Criteria` and runs `match` and `count` in parallel. Only the infrastructure adapter translates them to its persistence technology's own limit and offset:

```typescript
// request: { page?: number; pageSize?: number }
const page     = request.page     ?? 1;
const pageSize = request.pageSize ?? 20;

const criteria = new Criteria(filters, null, page, pageSize);

const [items, total] = await Promise.all([
  this.repository.match(criteria),
  this.repository.count(criteria),  // same Criteria — no duplicated filters
]);

return { data: items.map(i => i.toPrimitives()), total, page, pageSize };
```

## Anti-patterns

```typescript
// ❌ Criteria built in the controller
const criteria = new Criteria([...]);
await this.searcher.execute(criteria); // the use case receives Request*, not Criteria

// ❌ Repository receives loose filters
async findByUserId(userId: string): Promise<Order[]> {}

// ❌ Direct query without Criteria
this.repo.find({ where: { userId } });

// ❌ match() that ignores criteria
async match(criteria: Criteria): Promise<Order[]> {
  return this.repo.find(); // criteria ignored
}
```
