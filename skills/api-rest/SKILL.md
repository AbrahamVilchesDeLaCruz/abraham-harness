---
name: api-rest
description: "Convenciones RESTful de la API: rutas, métodos HTTP, status codes y acciones DDD con POST. Trigger: Al diseñar o implementar endpoints en apps/api/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## When to Use

- Al diseñar rutas de un nuevo recurso
- Al elegir el método HTTP correcto para una acción
- Al decidir el status code de una respuesta
- Al modelar acciones de dominio que no encajan en CRUD puro

> Lee `references/docs.md` para skills relacionadas, ADRs y documentación externa.

## Critical Patterns

### Rutas — convenciones base

```
GET    /products              ← listar (con query params para filtros)
GET    /products/:id          ← obtener uno
POST   /products              ← crear
PATCH  /products/:id          ← actualizar parcialmente
DELETE /products/:id          ← eliminar
```

**Reglas:**

- Recursos en `kebab-case` plural: `/products`, `/reviews-sessions`
- Sin verbos en la ruta: nunca `/products/create` ni `/getProduct`
- Anidamiento máximo de 2 niveles: `/collections/:id/products` — si necesitás más, replantear
- IDs siempre en el path, nunca en el body para GET/DELETE

### Status codes

| Situación                                            | Status                     |
| ---------------------------------------------------- | -------------------------- |
| GET exitoso con resultado                            | `200 OK`                   |
| GET exitoso sin resultado (lista vacía)              | `200 OK` con `[]`          |
| POST creación de recurso exitosa                     | `201 CREATED`              |
| PATCH / POST acción DDD exitosa sin body             | `204 NO CONTENT`           |
| PATCH / POST acción DDD exitosa con body             | `200 OK`                   |
| Recurso no encontrado                                | `404 NOT FOUND`            |
| Validación fallida (campo inválido)                  | `422 UNPROCESSABLE ENTITY` |
| Conflicto de estado                                  | `409 CONFLICT`             |
| No autorizado (sin token)                            | `401 UNAUTHORIZED`         |
| Sin permisos (token válido, acción prohibida)        | `403 FORBIDDEN`            |

> Las acciones DDD con POST (`/orders/:id/complete`, `/orders/:id/resume`) usan `200 OK` si devuelven body o `204 NO CONTENT` si no. Nunca `201` — ese código es exclusivo de creaciones de recurso.

### Acciones DDD con POST

Cuando una acción de dominio no es CRUD puro — tiene semántica propia — se modela como sub-recurso con POST.

```
POST /products/:id/review          ← revisar una product (spaced repetition)
POST /products/:id/archive         ← archivar
POST /orders/:id/complete             ← completar partida (devuelve stats)
POST /orders/:id/resume               ← reanudar partida pausada (devuelve estado)
POST /orders/:id/payments             ← registrar intento (sin body de respuesta)
POST /reviews-sessions/:id/end ← finalizar sesión
```

> `POST /orders` (sin `:id`) es creación de recurso → devuelve `201 CREATED`. Las acciones DDD van siempre sobre un recurso existente: `/orders/:id/{acción}`.

**Cuándo usar acción DDD vs PATCH:**

| Criterio                                                            | Usar PATCH | Usar POST /{acción} |
| ------------------------------------------------------------------- | ---------- | ------------------- |
| Cambio de datos simples                                             | ✅         |                     |
| Transición de estado con reglas de negocio                          |            | ✅                  |
| La acción tiene nombre en el dominio (`review`, `archive`, `start`) |            | ✅                  |
| Idempotente                                                         | ✅         | depende             |

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

Todo endpoint debe estar documentado con Swagger. Los decoradores se aplican en dos niveles:

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
  summary: 'Complete a order session',
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

> Incluir solo los status codes que el endpoint puede devolver realmente — no añadir decoradores genéricos que no apliquen.

### Naming del método de acción

El método de acción siempre se llama `handler`:

```typescript
async handler(
  @Param('id') id: string,
  @Body() body: RecordPaymentPostPayload,
  @CurrentUser() user: UserContext,
): Promise<void> { ... }
```

### Un controller por acción

Cada acción HTTP es un controller independiente. Ver skill `api-infrastructure` para naming y payloads.

```
products/infrastructure/controllers/
├── create-product-post.controller.ts       + create-product-post.payload.ts
├── search-products-get.controller.ts       + search-products-get.query.ts
├── find-product-get.controller.ts
├── update-product-patch.controller.ts      + update-product-patch.payload.ts
├── delete-product-delete.controller.ts
└── review-product-post.controller.ts       + review-product-post.payload.ts
```

Todos los controllers del recurso se registran en el módulo:

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

### Request/Response bodies

- **Request**: validado con `class-validator` + DTO solo en el controller (no pasa a application)
- **Response**: primitivos planos — nunca entidades de dominio
- **snake_case** en JSON de respuesta cuando es convención del equipo — decidir y ser consistente

### Query params para listados

```
GET /products?orderBy=createdAt&orderType=DESC&limit=20&offset=0
GET /products?filters[0][field]=front&filters[0][operator]=CONTAINS&filters[0][value]=hello
```

El controller extrae y pasa a use case como primitivos — ver skill `api-criteria`.

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
