---
name: api-application
description: "Convenciones de la capa Application en la API: Use Cases y Domain Services. Trigger: Al crear o modificar casos de uso o domain services en apps/api/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## When to Use

- Al crear un nuevo caso de uso
- Al crear o modificar un domain service
- Al decidir si lógica va en un use case o en un domain service

> Usa el template de `assets/use-case.template.md` al crear un nuevo use case.
> Lee `references/docs.md` para ADRs, skills relacionadas y docs externos.

## Critical Patterns

### Use Cases

Nombre: `{Entidad}{Verbo}` — forma de agente. Método siempre `execute()`.

```typescript
// catalog/product/application/create/product-creator.ts
@Injectable()
export class ProductCreator {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly repository: ProductRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
    @Inject(APP_METRICS)
    private readonly metrics: AppMetrics,
  ) {}

  async execute(request: RequestProductCreator): Promise<ProductPrimitives> {
    const product = Product.create(
      request.id,
      request.expression,
      request.meaning,
      request.category,
      request.subcategory,
      request.ipaNotation,
      request.nativeSpeech,
      request.examples.map((e) => ({ ...e, productId: request.id })),
      request.createdBy,
    );

    await this.repository.save(product);
    await this.publisher.publish(product.pullDomainEvents());

    this.logger.info("Product created", {
      productId: request.id,
      expression: request.expression,
    });

    this.metrics.increment("app_products_created_total");

    return product.toPrimitives();
  }
}
```

Re-exportar `Request*` y `Response*` en el mismo archivo del use case:

```typescript
// order-completer.ts — al inicio del archivo, tras los imports
export type { RequestOrderCompleter, ResponseOrderCompleter };
```

**Request\* — tipo del input:**

```typescript
// catalog/product/application/create/request-product-creator.ts
export type RequestProductCreator = {
  id: string;
  expression: string;
  meaning: string;
  category: string;
  subcategory: string;
  ipaNotation: string | null;
  nativeSpeech: string | null;
  examples: { id: string; textEn: string; textEs: string; position: number }[];
  createdBy: string;
};
```

**`Response*` — tipo del output cuando devuelve datos complejos:**

```typescript
// sales/application/complete/response-order-completer.ts
export type ResponseOrderCompleter = {
  correctCount: number;
  totalCount: number;
  accuracy: number;
  duration: number;
  cardsViewed: number;
};
```

Crear `response-{entity}-{verb}er.ts` siempre que el use case devuelva más de un campo o el tipo no sea un primitivo simple. Re-exportarlo junto al `Request*` en el archivo del use case.

**Reglas:**

- Un caso de uso = una responsabilidad = un método público: `execute()`
- Recibe un `Request*` type — nunca primitivos sueltos, nunca clases DTO
- `Request*` y `Response*` son `type` alias — nunca clases con decoradores
- Retorna primitivos, `Response*`, o `void` — nunca entidades de dominio
- Los use cases de **write siempre inyectan `DOMAIN_EVENT_PUBLISHER`** — si el aggregate no emite eventos, es un bug en el aggregate, no una razón para omitirlo
- Inyectar `LOGGER_SERVICE` y `APP_METRICS` en todos los use cases que mutan estado
- Usar `toPrimitives()` para serializar la respuesta

### Domain Services

Cuando la **misma lógica de dominio** es necesaria en varios use cases, se extrae a un Domain Service en `domain/`. El criterio no es I/O vs no-I/O — es reutilización entre use cases.

```typescript
// sales/domain/guest-order-policy.ts  ← política pura: varios UCs la consultan
export class GuestOrderPolicy {
  static readonly MAX_CARD_COUNT_FOR_GUEST = 10;

  static assertCanStartNewOrder(todayOrderCount: number): void {
    if (todayOrderCount >= 3) throw new GuestOrderLimitReached();
  }
}
```

```typescript
// catalog/product/domain/product-finder.ts  ← domain service inyectable
// UpdateProduct, DeleteProduct, etc. todos necesitan primero encontrar la entidad
@Injectable()
export class ProductFinder {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly repository: ProductRepository,
  ) {}

  async findOrFail(id: ProductId): Promise<Product> {
    const product = await this.repository.search(id);
    if (!product) throw new ProductNotFound(id.value);
    return product;
  }
}
```

**Reglas:**

- Nombre: `{Feature}{Action}` — **sin sufijo `Service`**
- Archivo: `{feature}-{action}.ts` — ej: `product-finder.ts`, `guest-order-policy.ts`
- Método con verbo descriptivo: `findOrFail()`, `validate()`, `assertCanX()`
- **Si la lógica solo la usa un use case → va en el use case, no se extrae**
- **Si varios use cases comparten la lógica → Domain Service en `domain/`**
- Puede tener `@Injectable()` cuando necesita repositorios u otros puertos
- Clases estáticas para políticas puras (sin I/O): `GuestOrderPolicy`, `PausedOrderPolicy`

### UseCase vs Domain Service

|                  | Use Case                       | Domain Service                                     |
| ---------------- | ------------------------------ | -------------------------------------------------- |
| **Qué es**       | Una transacción de aplicación  | Lógica de dominio reutilizada por varios use cases |
| **Método**       | `execute()`                    | verbo descriptivo: `findOrFail()`, `assertCanX()`  |
| **Reutilizable** | No — un flujo concreto         | Sí — varios UCs lo llaman                          |
| **Dónde**        | `application/{verb}/`          | `domain/`                                          |
| **Ejemplo**      | `ProductCreator.execute()`   | `ProductFinder` (usado por updater, deleter…)    |
| **Criterio**     | Una sola acción de negocio     | Si extraes lógica de 2+ UCs, va aquí               |

### Inyección — nombre por ROL

El nombre de la variable inyectada refleja el ROL, no la clase concreta.

```typescript
// ✅
constructor(private readonly repository: ProductRepository) {}
constructor(private readonly finder: ProductFinder) {}
constructor(private readonly publisher: DomainEventPublisher) {}

// ❌
constructor(private readonly productRepository: TypeOrmProductRepository) {}
constructor(private readonly productFinderService: ProductFinderService) {}
```

### Verbos de casos de uso

| Acción        | Nombre              |
| ------------- | ------------------- |
| Crear         | `ProductCreator`  |
| Buscar uno    | `ProductFinder`   |
| Buscar varios | `ProductSearcher` |
| Actualizar    | `ProductUpdater`  |
| Eliminar      | `ProductDeleter`  |
| Iniciar       | `OrderStarter`       |
| Completar     | `OrderCompleter`     |

## Anti-patterns

```typescript
// ❌ Primitivos sueltos como parámetros
async execute(expression: string, meaning: string, category: string): Promise<void> {}
// ✅ Request type object
async execute(request: RequestProductCreator): Promise<void> {}

// ❌ Clase DTO con decoradores en application
export class CreateProductDto { expression: string; meaning: string; }

// ❌ Lógica de negocio en use case
async execute(request): Promise<void> {
  if (request.expression.length > 500) throw new Error('too long'); // va en VO o entidad
}

// ❌ Retornar entidad de dominio
async execute(id: string): Promise<Product> { ... } // retornar primitivos

// ❌ Nombre de inyección repite la clase
constructor(private readonly productCreator: ProductCreator) {}

// ❌ Sufijo Service en domain service
export class ProductFinderService {} // ProductFinder
```
