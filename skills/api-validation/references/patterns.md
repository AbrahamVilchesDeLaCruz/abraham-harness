# Validation: patterns and examples

These are framework-free versions. The code with decorators, the bootstrap and the guard live in the project's stack skill, in `references/api-validation.md`.

## Bootstrap — main.ts

`src/main.ts` creates the app from `AppModule`, applies global input validation, sets up CORS, the cookie parser, API documentation and the global prefix, then listens on `Number(process.env.PORT ?? 3000)`.

**Why transform input:**
HTTP query params always arrive as strings. With input transformation, number coercion in Query DTOs automatically converts `"1"` → `1` so integer and minimum validations work. JSON bodies already arrive typed from the client.

## Payload — Request Body

```typescript
// src/catalog/product/infrastructure/controllers/create-product-post.payload.ts

export class ExampleItem {
  id: string;

  textEn: string;

  description: string;

  position: number;
}

export class CreateProductPostPayload {
  id: string;

  name: string;

  meaning: string;

  category: string;

  subcategory: string;

  // validates only if the value is not null (allows explicit null)
  ipaNotation: string | null = null;

  examples: ExampleItem[];
}
```

Field rules: `ipaNotation` is validated only if the value is not `null` (it allows explicit `null`); `examples` is an array, and each item is validated as an `ExampleItem`.

## Query — Query Params

```typescript
// src/catalog/product/infrastructure/controllers/search-products-get.query.ts

export class SearchProductsGetQuery {
  category?: string;

  subcategory?: string;

  audioStatus?: string;

  // query params always arrive as strings — coercion converts before validating
  page?: number;

  pageSize?: number;
}
```

**Number coercion in Query only** — HTTP query params are always strings. With input transformation on, the coercion converts `"1"` → `1` so integer and minimum validations validate correctly. Do not coerce in Payloads: the JSON body already arrives typed.

## Global guard

`JwtAuthGuard` lives in `src/shared/infrastructure/auth/jwt.guard.ts` (not `jwt-auth.guard.ts`). It reads the public marker (`IS_PUBLIC_KEY = 'isPublic'`, from `public.decorator.ts`) on the handler and the class. If the endpoint is public it allows the request; otherwise it applies the JWT check.

Mark public endpoints with the public marker, in the controller.
