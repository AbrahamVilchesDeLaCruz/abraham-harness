# Template — AggregateRoot

Replace `__EntityName__` with the aggregate name (e.g.: `Product`).

```typescript
import { AggregateRoot } from '@/shared/domain/aggregate-root.js';
import { __EntityName__Id } from './__entity-name__-id.js';
import { __EntityName__CreatedEvent } from './events/__entity-name__-created.event.js';

// ─── Primitives ──────────────────────────────────────────────────────────────
// All fields as primitive types (string, number, boolean, Date, null)
// Arrays and nested primitive objects are allowed for child entities
export type __EntityName__Primitives = {
  id: string;
  // add fields here
  createdAt: Date;
};

// ─── Aggregate ───────────────────────────────────────────────────────────────
export class __EntityName__ extends AggregateRoot<__EntityName__Primitives> {

  public constructor(
    public readonly id: __EntityName__Id,
    // Immutable state → public readonly directly in the constructor
    // Mutable state → private _field + public getter
    private readonly _createdAt: Date,
  ) {
    super();
  }

  // ── Getters for mutable state ───────────────────────────────────────────
  // get field(): Type { return this._field; }

  // ── Factory for new entities — records domain events ───────────────────

  static create(params: {
    id: string;
    // add params here
  }): __EntityName__ {
    const entity = new __EntityName__(
      new __EntityName__Id(params.id),
      new Date(),
    );

    entity.record(new __EntityName__CreatedEvent(params.id, { /* data */ }));
    return entity;
  }

  // ── Factory for reconstitution from persistence — no domain events ────

  static fromPrimitives(primitives: __EntityName__Primitives): __EntityName__ {
    return new __EntityName__(
      new __EntityName__Id(primitives.id),
      primitives.createdAt,
    );
  }

  // ── toPrimitives ─────────────────────────────────────────────────────────

  toPrimitives(): __EntityName__Primitives {
    return {
      id: this.id.value,
      createdAt: this._createdAt,
    };
  }
}
```

## Decision: `public` vs `private` in the constructor

| State | Modifier | Pattern |
| --- | --- | --- |
| Immutable (does not change after creation) | `public readonly field` | Exposed directly |
| Mutable (may change through aggregate methods) | `private _field` + getter | Access is controlled |
