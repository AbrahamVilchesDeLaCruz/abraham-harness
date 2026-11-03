# Response Classes — Reference

## `ApiResponse<T>` and `PaginatedApiResponse<T>`

```typescript
// shared/infrastructure/http/response/api-response.ts
export class ApiResponse<T> {
  constructor(
    readonly data: T,
    readonly meta: ResponseMeta,
  ) {}

  static of<T>(data: T, requestId: string): ApiResponse<T> {
    return new ApiResponse(data, {
      timestamp: new Date().toISOString(),
      requestId,
    });
  }
}

export class PaginatedApiResponse<T> {
  constructor(
    readonly data: T[],
    readonly pagination: PaginationMeta,
    readonly meta: ResponseMeta,
  ) {}

  static of<T>(
    data: T[],
    pagination: PaginationMeta,
    requestId: string,
  ): PaginatedApiResponse<T> {
    return new PaginatedApiResponse(data, pagination, {
      timestamp: new Date().toISOString(),
      requestId,
    });
  }
}

export interface ResponseMeta {
  timestamp: string;
  requestId: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
```

## `resolveRequestId`

```typescript
// shared/infrastructure/http/resolve-request-id.ts

export function resolveRequestId(req: Request): string {
  const header = req.headers['x-request-id'];
  if (typeof header === 'string' && header.trim()) {
    return header;
  }
  return crypto.randomUUID();
}
```

> `header` can be a `string[]` when the same header is sent multiple times, so a plain `as string` cast is unsafe.  The real implementation checks `typeof === 'string'` before using the value and rejects empty strings via `.trim()`.  Never use the inline cast pattern shown in the anti-patterns section.

Import it in all controllers that return an envelope:

```typescript
import { resolveRequestId } from '@/shared/infrastructure/http/resolve-request-id.js';
```

---

## Controllers — complete examples

These are framework-free versions. The originals with framework markers live in the project's stack skill, in `references/api-response.md`.

### Query with pagination (GET)

```typescript
async handler(
  query: SearchOrdersGetQuery,
  req: Request,
  user: UserContext,
): Promise<PaginatedApiResponse<OrderPrimitives>> {
  const result = await this.searcher.execute({ userId: user.userId, ...query });

  const pageSize = result.pageSize;
  const totalPages = Math.ceil(result.total / pageSize);

  return PaginatedApiResponse.of(
    result.data,
    {
      page: result.page,
      pageSize,
      totalItems: result.total,
      totalPages,
      hasNextPage: result.page < totalPages,
      hasPrevPage: result.page > 1,
    },
    resolveRequestId(req),
  );
}
```

### Command with data (POST → 201)

```typescript
async handler(
  req: Request,
  body: StartOrderPostPayload,
  user: UserContext,
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
async handler(id: string, payload: UpdateProductPatchPayload): Promise<void> {
  await this.updater.execute({ id, ...payload });
}

async handler(id: string): Promise<void> {
  await this.deleter.execute({ id });
}
```

### DDD action (POST → 200, empty response body)

```typescript
async handler(id: string, user: UserContext): Promise<void> {
  await this.completer.execute({ orderId: id, userId: user.userId ?? null });
}
```

### Legitimate exception: auth endpoints (tokens + cookies)

Auth endpoints (`/auth/login`, `/auth/register`, `/auth/guest`, `/auth/refresh`) do **not** use `ApiResponse<T>`.  They return raw data because:
- They manage `Set-Cookie` headers for the `refreshToken` via a passthrough response object
- The client only needs `{ accessToken: string }` — wrapping in an envelope adds no value

```typescript
async handler(
  body: LoginAuthPostPayload,
  res: Response,
): Promise<{ accessToken: string }> {
  const result = await this.authenticator.execute({ ... });
  res.cookie('refreshToken', result.refreshTokenId, { httpOnly: true, ... });
  return { accessToken: result.accessToken };
}
```

This is the only valid exemption from the envelope rule.  Non-auth endpoints that skip `ApiResponse` are a bug.
