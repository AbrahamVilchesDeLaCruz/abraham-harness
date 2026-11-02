# REST: patterns and examples

### Routes — base conventions

```
GET    /products              ← list (with query params for filters)
GET    /products/:id          ← get one
POST   /products              ← create
PATCH  /products/:id          ← update partially
DELETE /products/:id          ← delete
```

### DDD actions with POST

```
POST /products/:id/review          ← review a product
POST /products/:id/archive         ← archive
POST /orders/:id/complete             ← complete an order (returns stats)
POST /orders/:id/resume               ← resume a paused order (returns state)
POST /orders/:id/payments             ← record an attempt (no response body)
POST /reviews-sessions/:id/end ← end the session
```

```typescript
// ✅ DDD action without a response body → 204
async handler(
  id: string,
  body: RecordPaymentPostPayload,
  user: UserContext,
): Promise<void> {
  await this.recorder.execute({
    orderId: id,
    productId: body.productId,
    approved: body.approved,
    userId: user.userId ?? null,
  });
}

// ✅ DDD action with a response body → 200
async handler(
  id: string,
  user: UserContext,
): Promise<ApiResponse<ResponseOrderCompleter>> {
  const data = await this.completer.execute({ orderId: id, userId: user.userId ?? null });
  return ApiResponse.of(data, resolveRequestId(req));
}

```

A verb in the route, such as `:id/doReview` or `review/:id`, is forbidden.

### API documentation — mandatory

**At class level:**

- Tags: the bounded context / resource name.
- Bearer auth: if the endpoint requires a JWT (omit on public endpoints).

**At method level:**

- Operation: summary and description.
- One documented response for each status code the endpoint can really return, each with a description. `422` also names `ValidationErrorResponse` as its type.
- `204` carries no body and no success-response documentation.

The markers per status code live in the project's stack skill.

### Naming the action method

```typescript
async handler(
  id: string,
  body: RecordPaymentPostPayload,
  user: UserContext,
): Promise<void> { ... }
```

### One controller per action

```
products/infrastructure/controllers/
├── create-product-post.controller.ts       + create-product-post.payload.ts
├── search-products-get.controller.ts       + search-products-get.query.ts
├── find-product-get.controller.ts
├── update-product-patch.controller.ts      + update-product-patch.payload.ts
├── delete-product-delete.controller.ts
└── review-product-post.controller.ts       + review-product-post.payload.ts
```

Register all of them in the product module.

### Query params for lists

```
GET /products?orderBy=createdAt&orderType=DESC&limit=20&offset=0
GET /products?filters[0][field]=name&filters[0][operator]=CONTAINS&filters[0][value]=hello
```

## Anti-patterns

```typescript
// ❌ One controller for the whole resource
export class ProductController { } // one controller per action

// ❌ Generic DTO without a semantic name
export class ProductDto { }        // CreateProductPostPayload / SearchProductsGetQuery

// ❌ Verb in the route
GET  /products/getAll
POST /products/create
POST /products/doReview/:id

// ❌ ID in the body for GET
GET /products  body: { id: '123' }

// ❌ 200 for creation — must be 201

// ❌ Returning a domain entity
return product; // return product.toPrimitives()

// ❌ Business logic in a controller — belongs in a value object or the domain
```
