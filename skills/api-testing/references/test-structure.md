# Testing — Structure and Anti-patterns

## Test pyramid

```
         /\
        /  \   E2E (few, slow)
       /────\
      /      \  Integration — Application with port mocks
     /────────\
    /          \  Unit — Domain (many, fast)
   /────────────\
```

## `/test` structure

Mirrors the `/src` structure exactly:

```
apps/api/src/products/
├── application/create/product-creator.ts
└── domain/product.ts

apps/api/test/products/
├── application/create/
│   ├── product-creator.spec.ts
│   └── request-product-creator-mother.ts
└── domain/
    ├── product-mother.ts
    ├── product-id-mother.ts
    └── image-url-mother.ts
```

Shared primitive Mothers:

```
apps/api/test/shared/domain/
├── mother-creator.ts    ← the test-data library lives here — single point of change
├── string-mother.ts
├── uuid-mother.ts
├── date-mother.ts
└── boolean-mother.ts
```

The shared fake-timers helper lives in `apps/api/test/shared/`.

## Mother hierarchy

```
MotherCreator          ← test-data library — single point of library change
      ↓
StringMother / UuidMother / NumberMother
      ↓
ProductIdMother      ← VO Mother, uses UuidMother
      ↓
ProductMother        ← composes its VOs' Mothers
      ↓
RequestProductCreatorMother  ← Mother of the use case's Request*
```

## Anti-patterns

```typescript
// ❌ State shared between tests
let sharedProduct: Product; // outside beforeEach

// ❌ Magic string when a Mother exists
const product = Product.fromPrimitives({ id: "123", name: "test", description: "test" });
```

- ❌ Concrete adapter in an application test
- ❌ Inline Mother in the spec
- ❌ Untyped mock functions for typed ports
