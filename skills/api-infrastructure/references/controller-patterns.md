# Controller Patterns — Reference

## Controller completo con Swagger

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
    description: 'Creates an order with the selected mode, module and item count.',
  })
  @ApiCreatedResponse({ description: 'Order created with id and product ids' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiUnprocessableEntityResponse({
    description: 'Invalid mode, module or item count',
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
      module: body.module ?? null,
      subcategory: body.subcategory ?? null,
      cardCount: body.cardCount,
      source: body.source,
    });
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
```

## Payload con Swagger

```typescript
// sales/infrastructure/controllers/start-order-post.payload.ts
export class StartOrderPostPayload {
  @ApiProperty({ description: 'Order mode', enum: ['standard', 'express'] })
  @IsString()
  @IsNotEmpty()
  mode: string;

  @ApiPropertyOptional({ description: 'Learning module' })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiPropertyOptional({ description: 'Subcategory' })
  @IsOptional()
  @IsString()
  subcategory?: string;

  @ApiProperty({ description: 'Number of items', example: 10 })
  @IsInt()
  @Min(1)
  @Max(50)
  cardCount: number;

  @ApiPropertyOptional({ description: 'Selection source', enum: ['catalog', 'weakest'] })
  @IsOptional()
  @IsString()
  source?: string;
}
```

## Query GET con paginación

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
  limit?: number = 20;

  @ApiPropertyOptional({ enum: ['standard', 'express'] })
  @IsOptional()
  @IsString()
  mode?: string;
}
```

## Controller de GET con paginación

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
      limit: query.limit ?? 20,
    });

    return PaginatedApiResponse.of(
      result.items,
      {
        page: query.page ?? 1,
        limit: query.limit ?? 20,
        total_items: result.total,
        total_pages: Math.ceil(result.total / (query.limit ?? 20)),
        has_next_page: (query.page ?? 1) * (query.limit ?? 20) < result.total,
        has_prev_page: (query.page ?? 1) > 1,
      },
      resolveRequestId(req),
    );
  }
}
```

## Controller command puro (PATCH/DELETE)

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
