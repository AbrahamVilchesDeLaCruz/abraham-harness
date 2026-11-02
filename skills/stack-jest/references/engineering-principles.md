# Jest and Faker — docs/engineering/engineering-principles.md

Fake-data details for the Object Mother hierarchy in `docs/engineering/engineering-principles.md`.

Faker lives only in `MotherCreator`: if the library changes, only two places are touched: `MotherCreator` and the primitive-type Mothers. The Domain row of the layer table uses Object Mothers with faker to build the input data.

```ts
// shared/domain/__mothers__/MotherCreator.ts
import { faker, type Faker } from '@faker-js/faker';

export class MotherCreator {
  static random(): Faker {
    return faker;
  }
}
```

```ts
// shared/domain/__mothers__/StringMother.ts
import { MotherCreator } from './MotherCreator';

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
// shared/domain/__mothers__/UuidMother.ts
import { MotherCreator } from './MotherCreator';

export class UuidMother {
  static random(): string {
    return MotherCreator.random().string.uuid();
  }
}
```

Benefit: Faker appears only in `MotherCreator`: changing library = a single file.
