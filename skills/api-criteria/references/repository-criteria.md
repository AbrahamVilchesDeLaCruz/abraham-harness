# Repository Criteria — Reference

The complete persistence implementation lives in the project's persistence stack skill, in `references/api-criteria.md`.

## What `match()` does

For every filter in `criteria.filters`:

- `value === null` with `EQ` → `IS NULL`; with any other operator → `IS NOT NULL`.
- Any other value → `field operator :param`, with a named parameter `p_{field}`.

Then apply `criteria.order` when present, `criteria.limit` when it is not `null`, and `criteria.offset` when it is not `null`. Map each result to the domain with `toDomain()`.

## Complete flow: Controller → Use Case → Repository

### Controller — extracts params, passes primitives to the use case

```typescript
async handler(
  query: SearchOrdersGetQuery,
  user: UserContext,
): Promise<PaginatedApiResponse<OrderPrimitives>> {
  return this.searcher.execute({
    userId: user.userId ?? null,
    status: query.status,
    limit: query.limit ?? 20,
    offset: query.offset ?? 0,
  });
}
```

### Use Case — builds `Criteria`

```typescript
export class PausedOrdersLister {
  async execute(request: RequestPausedOrdersLister): Promise<OrderPrimitives[]> {
    const criteria = new Criteria(
      [
        { field: 'userId', operator: FilterOperator.EQ, value: request.userId },
        { field: 'status', operator: FilterOperator.EQ, value: 'paused' },
      ],
      { field: 'startedAt', direction: OrderDirection.DESC },
    );

    const orders = await this.repository.match(criteria);
    return orders.map((g) => g.toPrimitives());
  }
}
```

## `count()` in the repository — for pagination

If the endpoint returns pagination, the repository also implements `count()` with the same `Criteria` (without `limit`/`offset` for the total). It applies the same filters as `match()` and returns the count.

Call both in parallel from the use case — never sequentially:

```typescript
const [items, total] = await Promise.all([
  this.repository.match(criteria),
  this.repository.count(criteria),
]);
```

## Available operators

| Operator | Generated SQL | Use case |
|---|---|---|
| `FilterOperator.EQ` | `= :value` / `IS NULL` | Exact equality, null check |
| `FilterOperator.NEQ` | `!= :value` / `IS NOT NULL` | Not equal, not null |
| `FilterOperator.GT` | `> :value` | Greater than (dates, numbers) |
| `FilterOperator.LT` | `< :value` | Less than |
| `FilterOperator.GTE` | `>= :value` | Greater than or equal |
| `FilterOperator.LTE` | `<= :value` | Less than or equal |
| `FilterOperator.LIKE` | `LIKE :value` | Partial search — add `%` in the value |
| `FilterOperator.IN` | `IN (:...value)` | List of values |
