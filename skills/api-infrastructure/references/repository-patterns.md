# Repository Patterns — Reference

The complete persistence implementation lives in the project's persistence stack skill, in `references/api-infrastructure.md`, and the module in the HTTP stack skill.

## Repository

A repository adapter implements the domain port (`implements OrderRepository`):

- `search(id)` finds by `id.value` and returns `this.toDomain(entity)`, or `null` when there is no entity.
- `match(criteria)` applies all the `Criteria` fields, as `api-criteria` describes, and maps each result with `toDomain()`.
- `save(order)` saves `this.toEntity(order)`.
- `remove(id)` deletes by `id.value`.

The private mappers:

```typescript
  private toDomain(entity: OrderEntity): Order {
    return Order.fromPrimitives({
      id: entity.id,
      userId: entity.userId,
      mode: entity.mode,
      channel: entity.channel,
      subcategory: entity.subcategory,
      source: entity.source ?? 'catalog',
      itemCount: entity.itemCount,
      status: entity.status,
      lastProductId: entity.lastProductId,
      startedAt: entity.startedAt,
      finishedAt: entity.finishedAt,
    });
  }

  private toEntity(order: Order): OrderEntity {
    const e = new OrderEntity();
    const p = order.toPrimitives();
    e.id = p.id;
    e.userId = p.userId;
    e.mode = p.mode;
    e.channel = p.channel;
    e.subcategory = p.subcategory;
    e.source = p.source;
    e.itemCount = p.itemCount;
    e.status = p.status;
    e.lastProductId = p.lastProductId;
    e.startedAt = p.startedAt;
    e.finishedAt = p.finishedAt;
    return e;
  }
```

## Persistence entity

```typescript
// sales/infrastructure/persistence/order.entity.ts
export class OrderEntity {
  id: string;

  userId: string | null;

  mode: string;

  channel: string | null;

  subcategory: string | null;

  source: string;

  itemCount: string;

  status: string;

  lastProductId: string | null;

  startedAt: Date;

  finishedAt: Date | null;
}
```

Each column maps its `snake_case` DB name: `user_id`, `item_count`, `last_product_id`, `started_at`, `finished_at`.

Nullable columns: `userId`, `channel`, `subcategory`, `lastProductId`, `finishedAt`. Defaults: `source` is `'catalog'` and `status` is `'in_progress'`.

## Module

The BC's framework module (in `sales/infrastructure/framework/`) imports the persistence entities it needs and registers:

- Controllers: `StartOrderPostController`, `CompleteOrderPostController`, `AbandonOrderPostController`, `PauseOrderPostController`, `ResumeOrderPostController`, `FindOrderSummaryGetController`.
- Providers: `OrderStarter`, `OrderCompleter`, `OrderAbandonner`, `OrderPauser`, `OrderResumer`, `OrderSummaryFinder`, `SalesExceptionRegistry`, and `ORDER_REPOSITORY` bound to the repository adapter.
- Exports: `SalesExceptionRegistry`.
