# api-criteria with TypeORM

The concept skill `api-criteria` defines the rules. This reference shows how to apply them with TypeORM.

## `match()` in a TypeORM repository — complete implementation

```typescript
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

  if (criteria.limit !== null) qb.take(criteria.limit);
  if (criteria.offset !== null) qb.skip(criteria.offset);

  const entities = await qb.getMany();
  return entities.map((e) => this.toDomain(e));
}
```

## `count()` in the repository — for pagination

If the endpoint returns pagination, the repository also implements `count()` with the same `Criteria` (without `limit`/`offset` for the total):

```typescript
async count(criteria: Criteria): Promise<number> {
  const qb = this.productRepo.createQueryBuilder('f');

  for (const filter of criteria.filters) {
    const param = `p_${filter.field}`;
    if (filter.value === null) {
      qb.andWhere(filter.operator === FilterOperator.EQ
        ? `f.${filter.field} IS NULL`
        : `f.${filter.field} IS NOT NULL`);
    } else {
      qb.andWhere(`f.${filter.field} ${filter.operator} :${param}`, { [param]: filter.value });
    }
  }

  return qb.getCount();
}
```

## External Documentation

- [TypeORM — SelectQueryBuilder](https://typeorm.io/select-query-builder) — `andWhere`, `orderBy`, `take`, `skip`
- [TypeORM — Parameter binding](https://typeorm.io/select-query-builder#adding-where-name) — `:param` syntax to prevent SQL injection
