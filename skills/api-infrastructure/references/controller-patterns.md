# Controller Patterns — Reference

These are framework-free versions. Routing, status, validation and API documentation markers live in the project's stack skill, in `references/api-infrastructure.md`.

## Complete controller

```typescript
// sales/infrastructure/controllers/start-order-post.controller.ts
export class StartOrderPostController {
  constructor(private readonly starter: OrderStarter) {}

  async handler(
    req: Request,
    body: StartOrderPostPayload,
    user: UserContext,
  ): Promise<ApiResponse<ResponseOrderStarter>> {
    const data = await this.starter.execute({
      userId: user.userId ?? null,
      mode: body.mode,
      channel: body.channel ?? null,
      subcategory: body.subcategory ?? null,
      itemCount: body.itemCount,
      source: body.source,
    });
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
```

## Payload

```typescript
// sales/infrastructure/controllers/start-order-post.payload.ts
export class StartOrderPostPayload {
  mode: string;

  channel?: string;

  subcategory?: string;

  itemCount: number;

  source?: string;
}
```

## GET Query with pagination

```typescript
// sales/infrastructure/controllers/search-orders-stats-get.query.ts
export class SearchOrdersGetQuery {
  page?: number = 1;

  limit?: number = 20;

  mode?: string;
}
```

## GET controller with pagination

```typescript
export class SearchOrdersGetController {
  constructor(private readonly searcher: OrdersSearcher) {}

  async handler(
    req: Request,
    query: SearchOrdersGetQuery,
    user: UserContext,
  ): Promise<PaginatedApiResponse<OrderPrimitives>> {
    const result = await this.searcher.execute({
      userId: user.userId!,
      mode: query.mode,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });

    return PaginatedApiResponse.of(
      result.items,
      {
        page: query.page ?? 1,
        limit: query.limit ?? 20,
        total_items: result.total,
        total_pages: Math.ceil(result.total / (query.limit ?? 20)),
        has_next_page: (query.page ?? 1) * (query.limit ?? 20) < result.total,
        has_prev_page: (query.page ?? 1) > 1,
      },
      resolveRequestId(req),
    );
  }
}
```

## Pure command controller (PATCH/DELETE)

```typescript
async handler(
  id: string,
  body: UpdateProductPatchPayload,
): Promise<void> {
  await this.updater.execute({ id, ...body });
}

async handler(id: string): Promise<void> {
  await this.deleter.execute({ id });
}
```
