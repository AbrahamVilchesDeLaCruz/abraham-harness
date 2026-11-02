# api-validation with NestJS

The concept skill `api-validation` defines the rules. This reference shows how to apply them with NestJS, `class-validator`, `class-transformer` and Swagger.

## Rules

### ValidationPipe

- `whitelist: true` + `forbidNonWhitelisted: true` — **always** — rejects extra fields.
- `transform: true` + `errorHttpStatusCode: 422` — **always** — enables `@Type()` in queries and maps validation errors to 422.
- Configure the global `ValidationPipe` in `main.ts`.

### Payload and Query

- Never `@Type()` in Payloads — the JSON body already arrives typed.
- `@Type(() => Number)` **only in Query** for `page`, `pageSize`, `limit` and similar — query params arrive as strings from HTTP.
- `@ApiProperty` / `@ApiPropertyOptional` on all Payload and Query fields — Swagger is mandatory; in Payload, with `example`.
- `@IsOptional()` for simple optional fields.
- `@ValidateIf(o => o.field !== undefined)` for complex conditional validations.

### Guards and filters

- **Global guards and filters do not go in `main.ts`** — they are registered through DI in the NestJS modules:
  - `HttpExceptionFilter` → registered as `APP_FILTER` in `SharedModule`.
  - `JwtAuthGuard`, `GuestAuthGuard`, etc. → provided and exported from `AuthModule`.
- Public endpoints are marked with the `@Public()` decorator. See skill `api-auth` for the complete wiring.

## Decorator choice

| Field | Decorators |
| --- | --- |
| For simple optional fields | `@IsOptional()` + `@ApiPropertyOptional` |
| For fields that accept explicit `null` | `@IsOptional()` + `@ValidateIf((_, v) => v !== null)` to skip validations when the value is `null` |
| For nested objects (arrays of nested objects) | `@ValidateNested({ each: true })` + `@Type(() => NestedClass)` + `@IsArray()` |

## Bootstrap — main.ts

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // strip unknown properties
      forbidNonWhitelisted: true,   // throw on unknown properties
      transform: true,              // coerce query params / path params to declared types (needed for @Type())
      errorHttpStatusCode: 422,     // validation errors → 422 Unprocessable Entity
    }),
  );

  // ... CORS, cookieParser, Swagger setup, global prefix ...

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
}

void bootstrap();
```

**Why `transform: true`:**
HTTP query params always arrive as strings. With `transform: true`, `@Type(() => Number)` in Query DTOs automatically converts `"1"` → `1` so `@IsInt()` and `@Min()` work. JSON bodies already arrive typed from the client.

## Global `ValidationPipe` config

```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,               // strip unknown properties
    forbidNonWhitelisted: true,    // throw on unknown properties
    transform: true,               // auto-transform — needed for @Type() in query params
    errorHttpStatusCode: 422,      // validation errors → 422 Unprocessable Entity
  }),
);
```

## Payload — Request Body

```typescript
// src/catalog/product/infrastructure/controllers/create-product-post.payload.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class VariantItem {
  @ApiProperty({ example: '660e8400-e29b-41d4-a716-446655440001' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'Black, 40 cm' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ example: 'Adjustable desk lamp with LED light.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 1, minimum: 1, maximum: 3 })
  @IsNumber()
  @IsInt()
  @Min(1)
  @Max(3)
  position: number;
}

export class CreateProductPostPayload {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'desk lamp' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Adjustable LED lamp' })
  @IsString()
  @IsNotEmpty()
  summary: string;

  @ApiProperty({ example: 'lighting' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'desk_lamps' })
  @IsString()
  @IsNotEmpty()
  subcategory: string;

  @ApiPropertyOptional({ example: 'LAMP-0042', nullable: true })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)  // validates only if the value is not null (allows explicit null)
  @IsString()
  @IsNotEmpty()
  sku: string | null = null;

  @ApiProperty({ type: [VariantItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantItem)
  variants: VariantItem[];
}
```

## Query — Query Params

```typescript
// src/catalog/product/infrastructure/controllers/search-products-get.query.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchProductsGetQuery {
  @ApiPropertyOptional({ example: 'lighting' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'desk_lamps' })
  @IsOptional()
  @IsString()
  subcategory?: string;

  @ApiPropertyOptional({
    enum: ['pending', 'in_stock', 'out_of_stock', 'discontinued'],
    example: 'in_stock',
  })
  @IsOptional()
  @IsIn(['pending', 'in_stock', 'out_of_stock', 'discontinued'])
  stockStatus?: string;

  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)   // query params always arrive as strings — @Type() converts before validating
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20, minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}
```

**`@Type(() => Number)` in Query only** — HTTP query params are always strings. With `transform: true` in ValidationPipe, `@Type(() => Number)` converts `"1"` → `1` so `@IsInt()` and `@Min()` validate correctly. Do not use `@Type()` in Payloads: the JSON body already arrives typed.

## Global guard — JwtAuthGuard

```typescript
// src/shared/infrastructure/auth/public.decorator.ts
import { SetMetadata } from '@nestjs/common';
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = (): ReturnType<typeof SetMetadata> =>
  SetMetadata(IS_PUBLIC_KEY, true);
```

```typescript
// src/shared/infrastructure/auth/jwt.guard.ts  (no jwt-auth.guard.ts)
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
```

Use in a controller:

```typescript
@Public()
@Post('guest')
async guestLogin(): Promise<void> { ... }
```

## Templates

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean,
  IsEnum, IsUUID, Min, Max, IsArray, ValidateNested,
} from 'class-validator';

export class {Verb}{Entity}{Method}Payload {
  @ApiProperty({ description: 'Description of the field', example: 'value' })
  @IsString()
  @IsNotEmpty()
  requiredField: string;

  @ApiPropertyOptional({ description: 'Optional field', example: 'value' })
  @IsOptional()
  @IsString()
  optionalField?: string;

  @ApiProperty({ description: 'Enum field', enum: SomeEnum })
  @IsEnum(SomeEnum)
  enumField: SomeEnum;

  @ApiProperty({ description: 'Integer in range', minimum: 1, maximum: 50 })
  @IsInt()
  @Min(1)
  @Max(50)
  numericField: number;

  @ApiProperty({ description: 'UUID reference' })
  @IsUUID()
  idField: string;
}
```

```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class {Verb}{Entity}GetQuery {
  @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Filter by status', enum: SomeStatusEnum })
  @IsOptional()
  @IsEnum(SomeStatusEnum)
  status?: SomeStatusEnum;

  @ApiPropertyOptional({ description: 'Filter by text (partial match)' })
  @IsOptional()
  @IsString()
  search?: string;
}
```

`ValidationErrorResponse` is the class used in `@ApiUnprocessableEntityResponse`.

## External Documentation

- [class-validator — GitHub](https://github.com/typestack/class-validator#readme) — complete list of decorators
- [class-transformer — GitHub](https://github.com/typestack/class-transformer) — `@Type()`, `@Transform()`, `@Exclude()`
- [NestJS — Validation](https://docs.nestjs.com/techniques/validation) — `ValidationPipe`, `whitelist`, `forbidNonWhitelisted`
- [NestJS Swagger — @nestjs/swagger](https://docs.nestjs.com/openapi/introduction) — `@ApiProperty`, `@ApiPropertyOptional`

The concept skill uses neutral wording: the application bootstrap is `src/main.ts`.
