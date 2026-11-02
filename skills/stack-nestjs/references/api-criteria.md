# api-criteria with NestJS

The concept skill `api-criteria` defines the rules. This reference shows how to apply them with NestJS.

## Controller — extracts params, passes primitives to the use case

```typescript
@Get()
async handler(
  @Query() query: SearchOrdersGetQuery,
  @CurrentUser() user: UserContext,
): Promise<PaginatedApiResponse<OrderPrimitives>> {
  return this.searcher.execute({
    userId: user.userId ?? null,
    status: query.status,
    limit: query.limit ?? 20,
    offset: query.offset ?? 0,
  });
}
```

## Use Case — builds `Criteria`

```typescript
@Injectable()
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
