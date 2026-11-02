# api-rest with NestJS

The concept skill `api-rest` defines the rules. This reference shows how to apply them with NestJS and Swagger.

## Rules

- Every endpoint must be documented with Swagger. The decorators apply at two levels: class and method.
- Include only the status codes the endpoint can really return — do not add generic decorators that do not apply.
- **Request**: validated with `class-validator` + DTO only in the controller (it does not pass into application).

## DDD actions with POST

```typescript
// ✅ DDD action without a response body → 204
@Post(':id/payments')
@HttpCode(HttpStatus.NO_CONTENT)
async handler(
  @Param('id') id: string,
  @Body() body: RecordPaymentPostPayload,
  @CurrentUser() user: UserContext,
): Promise<void> {
  await this.recorder.execute({
    orderId: id,
    productId: body.productId,
    correct: body.correct,
    userId: user.userId ?? null,
  });
}

// ✅ DDD action with a response body → 200
@Post(':id/complete')
@HttpCode(HttpStatus.OK)
async handler(
  @Param('id') id: string,
  @CurrentUser() user: UserContext,
): Promise<ApiResponse<ResponseOrderCompleter>> {
  const data = await this.completer.execute({ orderId: id, userId: user.userId ?? null });
  return ApiResponse.of(data, resolveRequestId(req));
}

// ❌ Verb in the route
@Post(':id/doReview')
@Post('review/:id')
```

## Swagger — mandatory decorators

**At class level:**

```typescript
@ApiTags('sales')               // ← bounded context / resource name
@ApiBearerAuth('access-token')   // ← if the endpoint requires a JWT (omit on public endpoints)
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class CompleteOrderPostController { ... }
```

**At method level:**

```typescript
@Post(':id/complete')
@HttpCode(HttpStatus.OK)
@ApiOperation({
  summary: 'Complete an order session',
  description: 'Marks the order as completed and returns summary stats.',
})
@ApiOkResponse({ description: 'Order completed with summary stats' })
@ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
@ApiUnprocessableEntityResponse({
  description: 'Validation error',
  type: ValidationErrorResponse,
})
async handler(...) { ... }
```

**Response decorators per status code:**

| Status | Swagger decorator |
| ------ | ----------------- |
| `200`  | `@ApiOkResponse({ description: '...' })` |
| `201`  | `@ApiCreatedResponse({ description: '...' })` |
| `204`  | (none — 204 carries no body and no success-response decorator) |
| `401`  | `@ApiUnauthorizedResponse({ description: '...' })` |
| `403`  | `@ApiForbiddenResponse({ description: '...' })` |
| `404`  | `@ApiNotFoundResponse({ description: '...' })` |
| `409`  | `@ApiConflictResponse({ description: '...' })` |
| `422`  | `@ApiUnprocessableEntityResponse({ description: '...', type: ValidationErrorResponse })` |

## Naming the action method

```typescript
async handler(
  @Param('id') id: string,
  @Body() body: RecordPaymentPostPayload,
  @CurrentUser() user: UserContext,
): Promise<void> { ... }
```

## Registering the controllers

```typescript
@Module({
  controllers: [
    CreateProductPostController,
    SearchProductsGetController,
    FindProductGetController,
    UpdateProductPatchController,
    DeleteProductDeleteController,
    ReviewProductPostController,
  ],
})
export class ProductModule {}
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

// ❌ 200 for creation
@Post() @HttpCode(HttpStatus.OK)  // must be 201

// ❌ Returning a domain entity
return product; // return product.toPrimitives()

// ❌ Business logic in a controller
if (body.quality > 5) throw new BadRequestException(); // belongs in a value object or the domain
```

## External Documentation

- [NestJS — Controllers](https://docs.nestjs.com/controllers) — routing, params, body decorators
