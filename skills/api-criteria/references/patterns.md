# Criteria: patrones y ejemplos

## Estructura de `Criteria`

```typescript
// shared/domain/criteria.ts
export class Criteria {
  constructor(
    readonly filters: Filter[] = [],
    readonly order: Order | null = null,
    readonly limit: number | null = null,
    readonly offset: number | null = null,
  ) {}
}

export enum FilterOperator {
  EQ = '=', NEQ = '!=',
  GT = '>', LT = '<', GTE = '>=', LTE = '<=',
  LIKE = 'LIKE', IN = 'IN',
}

export enum OrderDirection { ASC = 'ASC', DESC = 'DESC' }

export type Filter = { field: string; operator: FilterOperator; value: unknown; };
export type Order  = { field: string; direction: OrderDirection; };
```

## Construcción — siempre `new Criteria([...])`

```typescript
// Criteria con filtros, orden y paginación
const criteria = new Criteria(
  [
    { field: 'userId', operator: FilterOperator.EQ, value: userId },
    { field: 'status', operator: FilterOperator.EQ, value: 'active' },
    { field: 'startedAt', operator: FilterOperator.GTE, value: today },
  ],
  { field: 'startedAt', direction: OrderDirection.DESC },
  20,  // limit
  0,   // offset
);

// value: null → IS NULL / IS NOT NULL (el repositorio lo traduce)
const criteria = new Criteria([
  { field: 'finishedAt', operator: FilterOperator.EQ, value: null },  // IS NULL
]);
```

## Filtros opcionales — construcción condicional

Cuando no todos los filtros son obligatorios, construir el array dinámicamente:

```typescript
const filters: Filter[] = [];

if (request.category)
  filters.push({ field: 'category', operator: FilterOperator.EQ, value: request.category });
if (request.subcategory)
  filters.push({ field: 'subcategory', operator: FilterOperator.EQ, value: request.subcategory });

const criteria = new Criteria(filters, null, pageSize, (page - 1) * pageSize);
```

## Paginación con `page`/`pageSize` y `count()`

El cliente envía `page` + `pageSize` (más natural que `offset`). El use case convierte y ejecuta `match` y `count` en paralelo:

```typescript
// request: { page?: number; pageSize?: number }
const page     = request.page     ?? 1;
const pageSize = request.pageSize ?? 20;

const criteria = new Criteria(filters, null, pageSize, (page - 1) * pageSize);

const [items, total] = await Promise.all([
  this.repository.match(criteria),
  this.repository.count(criteria),  // mismo Criteria — sin duplicar filtros
]);

return { data: items.map(i => i.toPrimitives()), total, page, pageSize };
```

## Anti-patterns

```typescript
// ❌ Criteria construido en el controller
const criteria = new Criteria([...]);
await this.searcher.execute(criteria); // el use case recibe Request*, no Criteria

// ❌ Repositorio recibe filtros sueltos
async findByUserId(userId: string): Promise<Order[]> {}

// ❌ QueryBuilder directo sin Criteria
this.repo.find({ where: { userId } });

// ❌ match() que ignora criteria
async match(criteria: Criteria): Promise<Order[]> {
  return this.repo.find(); // criteria ignorado
}
```
