# api-repository with TypeORM

The concept skill `api-repository` owns the port and method semantics. This reference maps its persistence adapter to TypeORM. Confirm the installed version before relying on version-sensitive APIs.

## Adapter rules

- Prefix the adapter with `TypeOrm` and place it in `infrastructure/persistence/`.
- Inject the TypeORM repository for the persistence entity, not the domain port.
- Keep `toDomain()` and `toEntity()` private. The entity never leaves the adapter.
- Build query intent in the use case/domain service with `Criteria`. Translate filters, ordering and pagination only inside the adapter.
- Map criterion fields through an allowlist to known entity columns before interpolation. Bind values as parameters; never interpolate external values or unvalidated field names.
- Implement `count(criteria)` from the same filters as `match`, without applying page, page size or ordering to the count.

```typescript
@Injectable()
export class TypeOrmOrderRepository implements OrderRepository {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly repository: Repository<OrderEntity>,
  ) {}

  async search(id: OrderId): Promise<Order | null> {
    const entity = await this.repository.findOneBy({ id: id.value });
    return entity ? this.toDomain(entity) : null;
  }

  async match(criteria: Criteria): Promise<Order[]> {
    const query = this.repository.createQueryBuilder('order');
    for (const [index, filter] of criteria.filters.entries()) {
      const column = this.criteriaColumn(filter.field); // allowlist; not user-supplied SQL
      const parameter = `filter_${index}`;
      if (filter.value === null) {
        query.andWhere(
          filter.operator === FilterOperator.EQ
            ? `order.${column} IS NULL`
            : `order.${column} IS NOT NULL`,
        );
      } else {
        query.andWhere(`order.${column} ${this.operatorSql(filter.operator)} :${parameter}`, {
          [parameter]: filter.value,
        });
      }
    }

    if (criteria.order) {
      query.orderBy(`order.${this.criteriaColumn(criteria.order.field)}`, criteria.order.direction);
    }
    if (criteria.pageSize !== null) {
      query.take(criteria.pageSize);
      query.skip(((criteria.page ?? 1) - 1) * criteria.pageSize);
    }

    return (await query.getMany()).map((entity) => this.toDomain(entity));
  }

  async count(criteria: Criteria): Promise<number> {
    const query = this.repository.createQueryBuilder('order');
    this.applyFilters(query, criteria.filters);
    return query.getCount();
  }

  async save(order: Order): Promise<void> {
    await this.repository.save(this.toEntity(order));
  }

  async remove(id: OrderId): Promise<void> {
    await this.repository.delete({ id: id.value });
  }

  private toDomain(entity: OrderEntity): Order { /* map explicitly */ }
  private toEntity(order: Order): OrderEntity { /* map explicitly */ }
  private criteriaColumn(field: OrderCriteriaField): string { /* exhaustive allowlist */ }
  private operatorSql(operator: FilterOperator): string { /* exhaustive operator allowlist */ }
  private applyFilters(query: SelectQueryBuilder<OrderEntity>, filters: Filter[]): void { /* shared filter translation */ }
}
```

The mapping helpers are abbreviated: implement them exhaustively for the bounded context and test them. Keep `applyFilters` shared by `match` and `count` so both agree on null and operator semantics.

## TypeORM operations

- `findOneBy` reads by a primary-key criteria object.
- `save` persists an entity; `delete` removes rows matching a criteria object.
- `QueryBuilder` supports bound parameters, ordering, `take`/`skip`, and `getCount()`.

See the current [Repository API](https://typeorm.io/repository-api) and [Select Query Builder](https://typeorm.io/select-query-builder) documentation when implementation details depend on the installed version.
