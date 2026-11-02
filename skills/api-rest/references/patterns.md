# REST: patrones y ejemplos

### Rutas — convenciones base

```
GET    /products              ← listar (con query params para filtros)
GET    /products/:id          ← obtener uno
POST   /products              ← crear
PATCH  /products/:id          ← actualizar parcialmente
DELETE /products/:id          ← eliminar
```

### Acciones DDD con POST

```
POST /products/:id/review          ← revisar una product (spaced repetition)
POST /products/:id/archive         ← archivar
POST /orders/:id/complete             ← completar partida (devuelve stats)
POST /orders/:id/resume               ← reanudar partida pausada (devuelve estado)
POST /orders/:id/payments             ← registrar intento (sin body de respuesta)
POST /reviews-sessions/:id/end ← finalizar sesión
```

```typescript
// ✅ Acción DDD sin body de respuesta → 204
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

// ✅ Acción DDD con body de respuesta → 200
@Post(':id/complete')
@HttpCode(HttpStatus.OK)
async handler(
  @Param('id') id: string,
  @CurrentUser() user: UserContext,
): Promise<ApiResponse<ResponseOrderCompleter>> {
  const data = await this.completer.execute({ orderId: id, userId: user.userId ?? null });
  return ApiResponse.of(data, resolveRequestId(req));
}

// ❌ Verbo en la ruta
@Post(':id/doReview')
@Post('review/:id')
```

### Swagger — decoradores obligatorios

**A nivel de clase:**

```typescript
@ApiTags('sales')               // ← nombre del bounded context / recurso
@ApiBearerAuth('access-token')   // ← si el endpoint requiere JWT (omitir en endpoints públicos)
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class CompleteOrderPostController { ... }
```

**A nivel de método:**

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

**Decoradores de respuesta por status code:**

| Status | Decorador Swagger |
| ------ | ----------------- |
| `200`  | `@ApiOkResponse({ description: '...' })` |
| `201`  | `@ApiCreatedResponse({ description: '...' })` |
| `204`  | (ninguno — 204 no lleva body ni decorador de respuesta exitosa) |
| `401`  | `@ApiUnauthorizedResponse({ description: '...' })` |
| `403`  | `@ApiForbiddenResponse({ description: '...' })` |
| `404`  | `@ApiNotFoundResponse({ description: '...' })` |
| `409`  | `@ApiConflictResponse({ description: '...' })` |
| `422`  | `@ApiUnprocessableEntityResponse({ description: '...', type: ValidationErrorResponse })` |

### Naming del método de acción

```typescript
async handler(
  @Param('id') id: string,
  @Body() body: RecordPaymentPostPayload,
  @CurrentUser() user: UserContext,
): Promise<void> { ... }
```

### Un controller por acción

```
products/infrastructure/controllers/
├── create-product-post.controller.ts       + create-product-post.payload.ts
├── search-products-get.controller.ts       + search-products-get.query.ts
├── find-product-get.controller.ts
├── update-product-patch.controller.ts      + update-product-patch.payload.ts
├── delete-product-delete.controller.ts
└── review-product-post.controller.ts       + review-product-post.payload.ts
```

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

### Query params para listados

```
GET /products?orderBy=createdAt&orderType=DESC&limit=20&offset=0
GET /products?filters[0][field]=front&filters[0][operator]=CONTAINS&filters[0][value]=hello
```

## Anti-patterns

```typescript
// ❌ Un controller para todo el recurso
export class ProductController { } // un controller por acción

// ❌ DTO genérico sin nombre semántico
export class ProductDto { }        // CreateProductPostPayload / SearchProductsGetQuery

// ❌ Verbo en la ruta
GET  /products/getAll
POST /products/create
POST /products/doReview/:id

// ❌ ID en body para GET
GET /products  body: { id: '123' }

// ❌ 200 para creación
@Post() @HttpCode(HttpStatus.OK)  // debe ser 201

// ❌ Devolver entidad de dominio
return product; // devolver product.toPrimitives()

// ❌ Lógica de negocio en controller
if (body.quality > 5) throw new BadRequestException(); // va en VO o dominio
```
