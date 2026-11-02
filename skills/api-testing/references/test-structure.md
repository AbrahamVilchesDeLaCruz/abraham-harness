# Testing — Estructura y Anti-patterns

## Pirámide de tests

```
         /\
        /  \   E2E (pocos, lentos)
       /────\
      /      \  Integration — Application con mocks de puerto
     /────────\
    /          \  Unit — Domain (muchos, rápidos)
   /────────────\

## Estructura de `/test`

Replica exactamente la estructura de `/src`:

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

Mothers de primitivos compartidos:

```
apps/api/test/shared/domain/
├── mother-creator.ts    ← faker vive aquí — único punto de cambio
├── string-mother.ts
├── uuid-mother.ts
├── date-mother.ts
└── boolean-mother.ts
```

Helper de timers compartido:

```
apps/api/test/shared/jest-timers.ts   ← JestTimers.setup() / teardown()
```

## Jerarquía de Mothers

```
MotherCreator          ← faker — único punto de cambio de librería
      ↓
StringMother / UuidMother / NumberMother
      ↓
ProductIdMother      ← Mother del VO, usa UuidMother
      ↓
ProductMother        ← compone los Mothers de sus VOs
      ↓
RequestProductCreatorMother  ← Mother del Request* del use case
```

## Anti-patterns

```typescript
// ❌ Adaptador concreto en test de aplicación
const repository = new TypeOrmProductRepository(dataSource);

// ❌ Estado compartido entre tests
let sharedProduct: Product; // fuera de beforeEach

// ❌ String mágico cuando existe un Mother
const product = Product.fromPrimitives({ id: "123", front: "test", back: "test" });

// ❌ Mother inline en el spec
const mother = { id: uuid(), front: faker.lorem.word() };

// ❌ jest.fn() para puertos tipados
const repository = { save: jest.fn(), search: jest.fn() };
```
