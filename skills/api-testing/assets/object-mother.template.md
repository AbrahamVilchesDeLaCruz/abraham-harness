# Template — Object Mother

Replace `__EntityName__`, `__bc__` and `__module__` with the real values.

The hierarchy is: `MotherCreator` → primitive Mothers → VO Mothers → aggregate Mother.
**The test-data library lives only in `MotherCreator`** — never import it directly in a VO or aggregate Mother.

A Mother lives next to the test that uses it; shared Mothers go in `test/shared`. The Request Mother is `request-{use-case}.mother.ts`, next to `{use-case}.spec.ts`.

`MotherCreator` is shared and already exists — do not recreate it. It is in the testing stack skill.

## VO Mother

```typescript
// apps/api/test/shared/__module__/__entity-name__-id-mother.ts
import { UuidMother } from '@test/shared/domain/uuid-mother';
import { __EntityName__Id } from '@/__bc__/__module__/domain/__entity-name__-id';

export class __EntityName__IdMother {
  static random(): __EntityName__Id {
    return new __EntityName__Id(UuidMother.random());
  }

  static withValue(value: string): __EntityName__Id {
    return new __EntityName__Id(value);
  }
}
```

## Aggregate Mother

```typescript
// apps/api/test/shared/__module__/__entity-name__-mother.ts
import { __EntityName__ } from '@/__bc__/__module__/domain/__entity-name__';
import { __EntityName__IdMother } from './__entity-name__-id-mother';
import { StringMother } from '@test/shared/domain/string-mother';

type __EntityName__Primitives = {
  id: string;
  // add fields here
};

type Overrides = Partial<__EntityName__Primitives>;

export class __EntityName__Mother {

  // Random values — accepts partial overrides
  static random(overrides?: Overrides): __EntityName__ {
    return __EntityName__.fromPrimitives({
      id: __EntityName__IdMother.random().value,
      // add fields using VO Mothers here
      ...overrides,
    });
  }

  // Explicit values — tests with controlled data
  static create(primitives: __EntityName__Primitives): __EntityName__ {
    return __EntityName__.fromPrimitives(primitives);
  }

  // Rebuilds from the request — use case tests
  static from(request: Request__EntityName__Creator): __EntityName__ {
    return __EntityName__.fromPrimitives({ ...request });
  }
}
```
