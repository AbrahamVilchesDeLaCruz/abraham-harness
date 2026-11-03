# Vitest — engineering-principles.md in engineering-conventions

Tool details for the concepts in `engineering-principles.md` in `engineering-conventions`.

## API

Fake-data details for the Object Mother hierarchy.

Faker lives only in `MotherCreator`: if the library changes, only two places are touched: `MotherCreator` and the primitive-type Mothers. The Domain row of the layer table uses Object Mothers with faker to build the input data.

```ts
// apps/api/test/shared/domain/mother-creator.ts
import { faker, type Faker } from '@faker-js/faker';

export class MotherCreator {
  static random(): Faker {
    return faker;
  }
}
```

```ts
// apps/api/test/shared/domain/string-mother.ts
import { MotherCreator } from './mother-creator.js';

export class StringMother {
  static random(): string {
    return MotherCreator.random().lorem.word();
  }

  static sentence(): string {
    return MotherCreator.random().lorem.sentence();
  }

  static ofLength(length: number): string {
    return MotherCreator.random().string.alpha({ length });
  }
}
```

```ts
// apps/api/test/shared/domain/uuid-mother.ts
import { MotherCreator } from './mother-creator.js';

export class UuidMother {
  static random(): string {
    return MotherCreator.random().string.uuid();
  }
}
```

Benefit: Faker appears only in `MotherCreator`: changing library = a single file.

## Client

### Integration tests

In the frontend: Container + Component + MSW.

### What to test in each layer

| Layer | What to test | How |
|---|---|---|
| Pod hooks (frontend) | State logic, handlers | Unit: `renderHook` |
| Pod repository (frontend) | ViewModels through the mapper | Unit: `vi.mock` on the HTTP calls |
| Container (frontend) | Full flow with data | Integration: HTTP mocked with MSW |
