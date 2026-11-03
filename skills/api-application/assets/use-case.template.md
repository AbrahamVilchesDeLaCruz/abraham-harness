# Use Case Template

Copy this template when creating a new use case. Replace all `{Placeholders}`. Add the injection markers and framework imports from the project's stack skill.

## File: `{context}/application/{verb}/{entity}-{verb}er.ts`

```typescript
import {
  type {Entity}Repository,
  {ENTITY}_REPOSITORY,
} from '@/{context}/domain/{entity}.repository.js';
import {
  type DomainEventPublisher,
  DOMAIN_EVENT_PUBLISHER,
} from '@/shared/domain/domain-event-publisher.js';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger.js';
import { type AppMetrics, APP_METRICS } from '@/shared/domain/app-metrics.js';
import { {Entity}Id } from '@/{context}/domain/{entity}-id.js';
import { {Entity}NotFound } from '@/{context}/domain/exceptions/{entity}-not-found.js';
import { type Request{Entity}{Verb}er } from './request-{entity}-{verb}er.js';
import { type Response{Entity}{Verb}er } from './response-{entity}-{verb}er.js';

export type { Request{Entity}{Verb}er, Response{Entity}{Verb}er };

export class {Entity}{Verb}er {
  constructor(
    private readonly repository: {Entity}Repository,
    private readonly publisher: DomainEventPublisher,
    private readonly logger: Logger,
    private readonly metrics: AppMetrics,
  ) {}

  async execute(request: Request{Entity}{Verb}er): Promise<Response{Entity}{Verb}er> {
    const {entity} = await this.repository.search(new {Entity}Id(request.id));
    if (!{entity}) throw new {Entity}NotFound(request.id);

    {entity}.{action}(/* ... */);

    await this.repository.save({entity});
    await this.publisher.publish({entity}.pullDomainEvents());

    this.logger.info('{Entity} {verb}ed', { {entity}Id: request.id });
    this.metrics.increment('app_{entities}_{verb}ed_total');

    return {entity}.toPrimitives();
  }
}
```

## File: `{context}/application/{verb}/request-{entity}-{verb}er.ts`

```typescript
export type Request{Entity}{Verb}er = {
  id: string;
  // Add request fields here
};
```

## File: `{context}/application/{verb}/response-{entity}-{verb}er.ts`

Only create this file when the use case returns a complex type (not primitives).

```typescript
export type Response{Entity}{Verb}er = {
  // Add response fields here
};
```

## Checklist

- [ ] One use case = one responsibility — if it does more than one thing, split it
- [ ] Receives a `Request*` type — never an HTTP payload or Criteria directly
- [ ] `repository.save()` **before** `publisher.publish()`
- [ ] `publisher.publish()` present — write use cases always publish events
- [ ] `logger.info()` at the end of the happy path
- [ ] `metrics.increment()` with the name `app_{entities}_{verb}ed_total`
- [ ] Domain errors thrown from the aggregate/value object, not from the use case
- [ ] All ports injected by token — never injection by concrete type
- [ ] Re-export of `Request*` and `Response*` in the same file as the use case
