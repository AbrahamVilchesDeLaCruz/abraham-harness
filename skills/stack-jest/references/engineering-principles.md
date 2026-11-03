# Jest and Faker — engineering-principles.md in engineering-conventions

Fake-data details for the Object Mother hierarchy in `engineering-principles.md` in `engineering-conventions`.

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
import { MotherCreator } from './mother-creator';

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
import { MotherCreator } from './mother-creator';

export class UuidMother {
  static random(): string {
    return MotherCreator.random().string.uuid();
  }
}
```

Benefit: Faker appears only in `MotherCreator`: changing library = a single file.
