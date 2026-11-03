# api-infrastructure with TypeORM

The concept skill `api-infrastructure` defines the rules. This reference shows how to apply them with TypeORM.

## Rules

- Entities: `Entity` suffix, plural `snake_case` table; columns are `snake_case` in the DB and `camelCase` in code — use `name` in `@Column`.
- TypeORM entities live only in `infrastructure/persistence/` — never in domain or application.
- Repositories: `TypeOrm` prefix — makes the concrete implementation clear.
- `toDomain()` and `toEntity()` are private — the TypeORM Entity never leaves the repository.

## Complete TypeORM repository with Criteria

```typescript
// sales/infrastructure/persistence/typeorm-order.repository.ts
@Injectable()
export class TypeOrmOrderRepository implements OrderRepository {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
  ) {}

  async search(id: OrderId): Promise<Order | null> {
    const entity = await this.orderRepo.findOneBy({ id: id.value });
    return entity ? this.toDomain(entity) : null;
  }

  async match(criteria: Criteria): Promise<Order[]> {
    const qb = this.orderRepo.createQueryBuilder('g');

    for (const filter of criteria.filters) {
      const param = `p_${filter.field}`;
      if (filter.value === null) {
        if (filter.operator === FilterOperator.EQ) {
          qb.andWhere(`g.${filter.field} IS NULL`);
        } else {
          qb.andWhere(`g.${filter.field} IS NOT NULL`);
        }
      } else {
        qb.andWhere(`g.${filter.field} ${filter.operator} :${param}`, {
          [param]: filter.value,
        });
      }
    }

    if (criteria.order) {
      qb.orderBy(`g.${criteria.order.field}`, criteria.order.direction);
    }

    if (criteria.pageSize !== null) {
      // TypeORM works with limit and offset: the translation stays in this adapter
      qb.take(criteria.pageSize);
      qb.skip(((criteria.page ?? 1) - 1) * criteria.pageSize);
    }

    const entities = await qb.getMany();
    return entities.map((e) => this.toDomain(e));
  }

  async save(order: Order): Promise<void> {
    await this.orderRepo.save(this.toEntity(order));
  }

  async remove(id: OrderId): Promise<void> {
    await this.orderRepo.delete({ id: id.value });
  }

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
}
```

## Complete TypeORM entity

```typescript
// sales/infrastructure/persistence/order.entity.ts
@Entity('orders')
export class OrderEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true, type: 'uuid' })
  userId: string | null;

  @Column()
  mode: string;

  @Column({ nullable: true })
  channel: string | null;

  @Column({ nullable: true })
  subcategory: string | null;

  @Column({ default: 'catalog' })
  source: string;

  @Column({ name: 'item_count' })
  itemCount: string;

  @Column({ default: 'in_progress' })
  status: string;

  @Column({ name: 'last_product_id', nullable: true })
  lastProductId: string | null;

  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt: Date;

  @Column({ name: 'finished_at', type: 'timestamptz', nullable: true })
  finishedAt: Date | null;
}
```

## External Documentation

- [TypeORM — Repository](https://typeorm.io/repository-api) — `createQueryBuilder`, `save`, `delete`
- [TypeORM — QueryBuilder](https://typeorm.io/select-query-builder) — `andWhere`, `orderBy`, `take`, `skip`
