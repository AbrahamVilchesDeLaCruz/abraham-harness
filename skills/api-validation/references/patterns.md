# Validation: patrones y ejemplos

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

**Por qué `transform: true`:**
Los query params de HTTP siempre llegan como strings. Con `transform: true`, `@Type(() => Number)` en los Query DTOs convierte automáticamente `"1"` → `1` para que `@IsInt()` y `@Min()` funcionen. Los body JSON ya vienen tipados desde el cliente.

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

export class ExampleItem {
  @ApiProperty({ example: '660e8400-e29b-41d4-a716-446655440001' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'I need to catch up on my emails.' })
  @IsString()
  @IsNotEmpty()
  textEn: string;

  @ApiProperty({ example: 'Necesito ponerme al día con mis correos.' })
  @IsString()
  @IsNotEmpty()
  textEs: string;

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

  @ApiProperty({ example: 'catch up' })
  @IsString()
  @IsNotEmpty()
  expression: string;

  @ApiProperty({ example: 'ponerse al día' })
  @IsString()
  @IsNotEmpty()
  meaning: string;

  @ApiProperty({ example: 'phrasal_verbs' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'daily_life' })
  @IsString()
  @IsNotEmpty()
  subcategory: string;

  @ApiPropertyOptional({ example: '/kætʃ ʌp/', nullable: true })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)  // valida solo si el valor no es null (permite null explícito)
  @IsString()
  @IsNotEmpty()
  ipaNotation: string | null = null;

  @ApiProperty({ type: [ExampleItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExampleItem)
  examples: ExampleItem[];
}
```

## Query — Query Params

```typescript
// src/catalog/product/infrastructure/controllers/search-products-get.query.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchProductsGetQuery {
  @ApiPropertyOptional({ example: 'native_sounds' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'vowel_sounds' })
  @IsOptional()
  @IsString()
  subcategory?: string;

  @ApiPropertyOptional({
    enum: ['pending', 'generating', 'ready', 'failed'],
    example: 'ready',
  })
  @IsOptional()
  @IsIn(['pending', 'generating', 'ready', 'failed'])
  audioStatus?: string;

  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)   // query params siempre llegan como string — @Type() convierte antes de validar
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

**`@Type(() => Number)` en Query únicamente** — los query params de HTTP siempre son strings. Con `transform: true` en ValidationPipe, `@Type(() => Number)` convierte `"1"` → `1` para que `@IsInt()` y `@Min()` validen correctamente. No usar `@Type()` en Payloads: el body JSON ya viene tipado.

## Guard Global — JwtAuthGuard

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

Uso en controller:

```typescript
@Public()
@Post('guest')
async guestLogin(): Promise<void> { ... }
```
