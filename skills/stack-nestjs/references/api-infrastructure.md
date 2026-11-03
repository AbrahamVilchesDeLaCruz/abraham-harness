# api-infrastructure with NestJS

The concept skill `api-infrastructure` defines the rules. This reference shows how to apply them with NestJS and Swagger.

## Rules

- Swagger is mandatory: `@ApiTags`, `@ApiOperation`, `@ApiBearerAuth`, responses with status codes.
- `@IsOptional()` for optional fields.
- `@Type(() => Number)` in a Query only for `page`, `pageSize` (strings in HTTP).
- `@ApiProperty` / `@ApiPropertyOptional` on all fields.
- Deliver the NestJS module in `infrastructure/framework/`, next to the exception registries.

## Folder structure

```
infrastructure/
├── controllers/
│   ├── {verb}-{resource}-{method}.controller.ts
│   └── {verb}-{resource}-{method}.payload.ts
├── framework/        ← NestJS modules + exception registries
└── persistence/      ← TypeORM entities + repositories
```

## Complete controller with Swagger

```typescript
// sales/infrastructure/controllers/start-order-post.controller.ts
@ApiTags('sales')
@ApiBearerAuth('access-token')
@Controller('orders')
@UseGuards(AnyAuthGuard)
export class StartOrderPostController {
  constructor(private readonly starter: OrderStarter) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Start a new order session',
    description: 'Creates an order with the selected mode, channel and item count.',
  })
  @ApiCreatedResponse({ description: 'Order created with id and product ids' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiUnprocessableEntityResponse({
    description: 'Invalid mode, channel or item count',
    type: ValidationErrorResponse,
  })
  async handler(
    @Req() req: Request,
    @Body() body: StartOrderPostPayload,
    @CurrentUser() user: UserContext,
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

## Payload with Swagger

```typescript
// sales/infrastructure/controllers/start-order-post.payload.ts
export class StartOrderPostPayload {
  @ApiProperty({ description: 'Order mode', enum: ['standard', 'express'] })
  @IsString()
  @IsNotEmpty()
  mode: string;

  @ApiPropertyOptional({ description: 'Sales channel' })
  @IsOptional()
  @IsString()
  channel?: string;

  @ApiPropertyOptional({ description: 'Subcategory' })
  @IsOptional()
  @IsString()
  subcategory?: string;

  @ApiProperty({ description: 'Number of items', example: 10 })
  @IsInt()
  @Min(1)
  @Max(50)
  itemCount: number;

  @ApiPropertyOptional({ description: 'Selection source', enum: ['catalog', 'recommended'] })
  @IsOptional()
  @IsString()
  source?: string;
}
```

## GET Query with pagination

```typescript
// sales/infrastructure/controllers/search-orders-stats-get.query.ts
export class SearchOrdersGetQuery {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @ApiPropertyOptional({ enum: ['standard', 'express'] })
  @IsOptional()
  @IsString()
  mode?: string;
}
```

## GET controller with pagination

```typescript
@ApiTags('sales')
@ApiBearerAuth('access-token')
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class SearchOrdersGetController {
  constructor(private readonly searcher: OrdersSearcher) {}

  @Get()
  @ApiOperation({ summary: 'Search orders with filters and pagination' })
  @ApiOkResponse({ description: 'Paginated list of orders' })
  async handler(
    @Req() req: Request,
    @Query() query: SearchOrdersGetQuery,
    @CurrentUser() user: UserContext,
  ): Promise<PaginatedApiResponse<OrderPrimitives>> {
    const result = await this.searcher.execute({
      userId: user.userId!,
      mode: query.mode,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
    });

    return PaginatedApiResponse.of(
      result.items,
      {
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 20,
        totalItems: result.total,
        totalPages: Math.ceil(result.total / (query.pageSize ?? 20)),
        hasNextPage: (query.page ?? 1) * (query.pageSize ?? 20) < result.total,
        hasPrevPage: (query.page ?? 1) > 1,
      },
      resolveRequestId(req),
    );
  }
}
```

## Pure command controller (PATCH/DELETE)

```typescript
@Patch(':id')
@HttpCode(HttpStatus.NO_CONTENT)
@ApiOperation({ summary: 'Update product' })
@ApiNoContentResponse({ description: 'Updated successfully' })
async handler(
  @Param('id') id: string,
  @Body() body: UpdateProductPatchPayload,
): Promise<void> {
  await this.updater.execute({ id, ...body });
}

@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT)
@ApiNoContentResponse({ description: 'Deleted successfully' })
async handler(@Param('id') id: string): Promise<void> {
  await this.deleter.execute({ id });
}
```

## NestJS module

```typescript
// sales/infrastructure/framework/sales.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity])],
  controllers: [
    StartOrderPostController,
    CompleteOrderPostController,
    AbandonOrderPostController,
    PauseOrderPostController,
    ResumeOrderPostController,
    FindOrderSummaryGetController,
  ],
  providers: [
    OrderStarter,
    OrderCompleter,
    OrderAbandonner,
    OrderPauser,
    OrderResumer,
    OrderSummaryFinder,
    SalesExceptionRegistry,
    {
      provide: ORDER_REPOSITORY,
      useClass: TypeOrmOrderRepository,
    },
  ],
})
export class SalesModule {}
```

## Anti-patterns

```typescript
// ❌ One controller for the whole resource
export class OrderController { }

// ❌ Payload passing into application
async execute(payload: StartOrderPostPayload): Promise<void> {}

// ❌ match() that ignores Criteria
async match(criteria: Criteria): Promise<Order[]> {
  return this.repo.find(); // criteria ignored
}

// ❌ TypeORM entity leaving the repository
async search(id: OrderId): Promise<OrderEntity> { ... }

// ❌ Controller without Swagger
@Post() async handler(@Body() body): Promise<void> {}
```

## External Documentation

- [NestJS — Controllers](https://docs.nestjs.com/controllers) — routing, params, body, response
- [NestJS — Modules](https://docs.nestjs.com/modules) — `forFeature`, `imports`, `exports`
- [NestJS Swagger — @nestjs/swagger](https://docs.nestjs.com/openapi/introduction) — documentation decorators

The `api-auth` skill covers guards and `@CurrentUser` in controllers.
