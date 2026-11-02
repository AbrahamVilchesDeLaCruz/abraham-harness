# api-response with NestJS

The concept skill `api-response` defines the rules. This reference shows how to apply them with NestJS and Swagger.

## Rules

- Auth endpoints use `@Res({ passthrough: true })` to manage cookies and return the token directly without an envelope. This is the only exception to the `ApiResponse<T>` pattern.
- Auth endpoints manage `Set-Cookie` headers for the `refreshToken` via `@Res({ passthrough: true })`.

## Anti-patterns

```typescript
// ❌ .response.ts files per controller — FORBIDDEN
// search-orders-get.response.ts

// ❌ resolveRequestId inline in the controller (unsafe: does not validate array or empty string)
return ApiResponse.of(data, req.headers['x-request-id'] as string ?? crypto.randomUUID());

// ❌ Envelope on pure commands
@Patch(':id')
async handler(): Promise<{ success: true }> { ... }

// ❌ Without resolveRequestId
return ApiResponse.of(data, 'hardcoded-id');

// ❌ Omitting ApiResponse on non-auth endpoints
@Get('products')
async handler(): Promise<ProductPrimitives[]> { ... } // must be ApiResponse<ProductPrimitives[]>
```

## `resolveRequestId`

```typescript
// shared/infrastructure/http/resolve-request-id.ts
import { type Request } from 'express';

export function resolveRequestId(req: Request): string {
  const header = req.headers['x-request-id'];
  if (typeof header === 'string' && header.trim()) {
    return header;
  }
  return crypto.randomUUID();
}
```

## `apiEnvelopeSchema` — Swagger helper

`shared/infrastructure/http/response/api-envelope.schema.ts` holds `apiEnvelopeSchema(example)` — a helper for Swagger `@ApiOkResponse({ schema: ... })`. Use this helper when documenting query responses with `@ApiOkResponse`:

```typescript
// shared/infrastructure/http/response/api-envelope.schema.ts
import { apiEnvelopeSchema } from '@/shared/infrastructure/http/response/api-envelope.schema';

@ApiOkResponse({
  description: 'Top customers with viewer context',
  schema: apiEnvelopeSchema({
    entries: [{ position: 1, userId: 'user-uuid', totalOrders: 12 }],
    currentUser: { position: 1, userId: 'user-uuid', totalOrders: 12 },
  }),
})
```

This generates an OpenAPI `{ data, meta }` schema fragment from an example value.  Only needed when the generic Swagger types are insufficient to describe the response shape.

## Controllers — complete examples

### Query with pagination (GET)

```typescript
@Get()
@ApiOperation({ summary: 'Search orders' })
async handler(
  @Query() query: SearchOrdersGetQuery,
  @Req() req: Request,
  @CurrentUser() user: UserContext,
): Promise<PaginatedApiResponse<OrderPrimitives>> {
  const result = await this.searcher.execute({ userId: user.userId, ...query });

  const limit = result.pageSize;
  const totalPages = Math.ceil(result.total / limit);

  return PaginatedApiResponse.of(
    result.data,
    {
      page: result.page,
      limit,
      total_items: result.total,
      total_pages: totalPages,
      has_next_page: result.page < totalPages,
      has_prev_page: result.page > 1,
    },
    resolveRequestId(req),
  );
}
```

### Command with data (POST → 201)

```typescript
@Post()
@HttpCode(HttpStatus.CREATED)
@ApiCreatedResponse({ description: 'Order created with id and product ids' })
async handler(
  @Req() req: Request,
  @Body() body: StartOrderPostPayload,
  @CurrentUser() user: UserContext,
): Promise<ApiResponse<ResponseOrderStarter>> {
  const data = await this.starter.execute({
    userId: user.userId ?? null,
    mode: body.mode,
    itemCount: body.itemCount,
  });
  return ApiResponse.of(data, resolveRequestId(req));
}
```

### Pure command (PATCH/DELETE → 204)

```typescript
@Patch(':id')
@HttpCode(HttpStatus.NO_CONTENT)
async handler(@Param('id') id: string, @Body() payload: UpdateProductPatchPayload): Promise<void> {
  await this.updater.execute({ id, ...payload });
}

@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT)
async handler(@Param('id') id: string): Promise<void> {
  await this.deleter.execute({ id });
}
```

### Legitimate exception: auth endpoints (tokens + cookies)

```typescript
@Post('login')
@HttpCode(HttpStatus.OK)
async handler(
  @Body() body: LoginAuthPostPayload,
  @Res({ passthrough: true }) res: Response,
): Promise<{ accessToken: string }> {
  const result = await this.authenticator.execute({ ... });
  res.cookie('refreshToken', result.refreshTokenId, { httpOnly: true, ... });
  return { accessToken: result.accessToken };
}
```

## External Documentation

- [NestJS — Response](https://docs.nestjs.com/controllers#response) — `@HttpCode`, `@Header`, `Res`
