# DI Tokens Template

Copy this template when adding dependency injection tokens to a new module. The module registration lives in the project's stack skill, in `references/api-di.md`.

## File: `{context}/domain/{entity}.repository.ts` (token alongside interface)

```typescript
// The Symbol lives next to the interface it identifies
export interface {Entity}Repository {
  save({entity}: {Entity}): Promise<void>;
  search(id: {Entity}Id): Promise<{Entity} | null>;
  match(criteria: Criteria): Promise<{Entity}[]>;
  remove(id: {Entity}Id): Promise<void>;
}

export const {ENTITY}_REPOSITORY = Symbol('{Entity}Repository');
```

## Naming convention for tokens

```
{ENTITY}_REPOSITORY        → ORDER_REPOSITORY, USER_REPOSITORY
{ENTITY}_QUERY             → ORDER_STATS_QUERY, USER_STATS_QUERY (read-only projections)
{ENTITY}_SELECTOR          → PRODUCT_SELECTOR (domain selectors)
{ENTITY}_PROVIDER          → BESTSELLER_PRODUCT_IDS_PROVIDER (domain providers)
{ENTITY}_SERVICE           → EMAIL_SERVICE (external services)
DOMAIN_EVENT_PUBLISHER     → shared — publishes DomainEvent[]
DOMAIN_EVENT_CONSUMER      → shared — consumes message queues
LOGGER_SERVICE             → shared — Logger interface
APP_METRICS                → shared — AppMetrics interface
```

## Checklist

- [ ] The token (`Symbol`) is in the same file as the interface
- [ ] The concrete class (persistence and messaging adapters) is registered only in the infrastructure module
- [ ] Concrete classes are **never** exported — only the token
- [ ] The use case injects by token
- [ ] No circular-reference workaround if there is no real circular dependency
