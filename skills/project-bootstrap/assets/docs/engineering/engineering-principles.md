# Engineering Principles — myapp

> Design principles that apply to **the whole system**, frontend and backend.
> These are not arbitrary rules. Each one exists to solve a concrete problem that appears when a system grows.
> Understanding the **why** is as important as knowing the what.
> Framework details: read `references/engineering-principles.md` in the stack skills that match this project's stack table.

---

## 1. SOLID

### S — Single Responsibility Principle

A class or function has **a single reason to change**.

**Why it matters**: when a unit mixes responsibilities, a change in one affects the others. Bugs spread, tests get complicated, and the code becomes fragile.

In the backend:

- One Use Case = one action of the system. `ProductCreator` does not create and also search.
- A Domain Service solves one concrete domain problem. `ProductExistVerifier` only verifies existence.
- A Controller only orchestrates: receives the request, calls the use case, returns the response.

In the frontend:

- One Container = one data source. It does not mix queries of different resources.
- A pod hook encapsulates one cohesive group of state. `useProductFilters` does not also manage the tooltip.
- A Component renders and manages UI state. It does not fetch data.

```ts
// ❌ Violates SRP: the use case does too much
class ProductCreator {
  async execute(command: CreateProductCommand) {
    const exists = await this.repository.searchById(command.id)
    if (exists) throw new ProductAlreadyExists()
    const product = Product.create(...)
    await this.repository.save(product)
    await this.emailService.sendConfirmation(...)   // unrelated side effect
    await this.cacheService.invalidate(...)         // infra detail
  }
}

// ✅ Correct: each responsibility in its place
class ProductCreator {
  async execute(command: CreateProductCommand) {
    await this.productExistVerifier.verify(command.id)  // domain service
    const product = Product.create(...)
    await this.repository.save(product)
    await this.eventBus.publish(product.pullDomainEvents())  // the subscriber handles the rest
  }
}
```

---

### O — Open/Closed Principle

**Open to extension, closed to modification.**

**Why it matters**: modifying code that already works introduces regressions. Extending without modifying keeps what already works intact.

In the backend:

- Adding a new provider (LLM, storage, email) = creating a new adapter that implements the port. The use case is not touched.
- Domain Events allow adding derived behavior without modifying the original use case.

In the frontend:

- Adding a new filter to the pod = new state in the filter hook. The Component does not change its structure.
- Adding a new action to the Container = new mutation. The Component receives a new callback.

```ts
// ❌ Violates OCP: the use case must be modified for each new channel
class ProductCreator {
  async execute(command: CreateProductCommand) {
    // ...
    if (channel === 'email') await this.emailService.send(...)
    if (channel === 'push') await this.pushService.send(...)
  }
}

// ✅ Correct: the use case publishes an event; each subscriber extends the behavior
// New channel = new subscriber. ProductCreator is never touched again.
class OnProductCreatedSendEmail { ... }
class OnProductCreatedSendPushNotification { ... }
```

---

### L — Liskov Substitution Principle

**Any implementation of an interface must be substitutable without altering the expected behavior.**

**Why it matters**: if this does not hold, the abstractions are false. Tests use mocks that do not behave like the real implementation, and bugs appear only in production.

In the backend:

- `SqlProductRepository` and `InMemoryProductRepository` are interchangeable. Tests use the in-memory version; production uses the real persistence. The use case does not notice the difference.
- An adapter cannot add extra preconditions or return types different from those defined in the port.

In the frontend:

- A component that accepts `onClick?: () => void` cannot internally require that callback to return a specific value. If it does, it breaks the contract.

---

### I — Interface Segregation Principle

**Clients must not depend on interfaces they do not use.**

**Why it matters**: fat interfaces create unnecessary coupling. A change in a method you do not use forces you to update your implementation.

In the backend:

- The repository does not grow with methods specific to one use case. If `ProductCreator` only needs `save()` and `match()`, do not pollute the interface with `findByCollectionOrderedByScore()`.
- If an external service has many capabilities, define small ports specific to each use case.

In the frontend:

- The props of a Component do not include data that the Component does not use. If a sub-component only needs `title` and `onClose`, do not pass it the complete object.

---

### D — Dependency Inversion Principle

**High-level modules do not depend on low-level ones. Both depend on abstractions.**

**Why it matters**: coupling to concrete implementations makes it impossible to test in isolation and hinders technological change.

In the backend:

- The use case depends on `ProductRepository` (abstraction), not on `SqlProductRepository` (implementation).
- Injection happens in the Composition Root, never inside domain or application classes.

In the frontend:

- The Container depends on hooks (`useProducts`, `useCreateProduct`), not on an HTTP client or `fetch` directly.
- Components depend on typed callbacks, not on concrete stores or contexts.

```ts
// ❌ Violates DIP: instantiates the concrete dependency
class ProductCreator {
  private repository = new SqlProductRepository();
}

// ✅ Correct: receives the abstraction through the constructor
class ProductCreator {
  constructor(private readonly repository: ProductRepository) {}
}
```

---

## 2. Law of Demeter and Tell Don't Ask

### Law of Demeter

**Only talk to your immediate friends.** An object must not navigate the internal structure of another to obtain data.

```ts
// ❌ Violates Demeter: navigates three levels
const score = payment.getResult().getScore().getValue();

// ✅ Correct: the aggregate exposes what is necessary
const score = payment.currentScore();
```

### Tell, Don't Ask

**Do not ask for an object's state to decide what to do. Tell it what to do and let it decide.**

```ts
// ❌ Ask: you take the state out and decide outside
if (product.getStatus() === "active") {
  product.setStatus("archived");
  product.setArchivedAt(new Date());
}

// ✅ Tell: you tell it what to do, it manages its invariant
product.archive();
// internally Product.archive() verifies that it is active,
// updates the state, records the date and emits ProductArchivedEvent
```

**Why it matters in DDD**: business rules live in the aggregate, not scattered across use cases or services. If the state can be read and modified from outside, invariants are not guaranteed.

**In the frontend**: pod hooks apply the same principle. The Component does not ask for the filter state to decide what to render: the hook exposes the already processed state and handlers to act on it.

---

## 3. TDD — Test-Driven Development

### The cycle

```
Red → Green → Refactor
```

1. **Red** — write the failing test. Only the test, no implementation at all.
2. **Green** — write the minimum code for the test to pass. No optimizing.
3. **Refactor** — clean up the code while keeping the tests green.

**Why it matters**: TDD is not only a testing technique, it is a design technique. Writing the test first forces you to think about the interface before the implementation. The result is more decoupled code, with cleaner interfaces and clearer responsibilities.

### What TDD reveals

- If a test is hard to write, the class has too many dependencies → it violates SRP or DIP.
- If you need many mocks to test a unit, it is coupled to too many things.
- If the test is unreadable, the design of the public interface is confusing.

### Test pyramid

```
         /\
        /E2E\          ← few, slow, complete critical flows
       /──────\
      / Integr \       ← medium, validate that the pieces fit together
     /──────────\
    /    Unit    \     ← many, fast, a single responsibility
   /______________\
```

**Unit**: a single class or function in isolation. Mocked dependencies. Fast. They are the base.

**Integration**: several pieces together. In the backend: use case + real repository (in-memory or test database). In the frontend: Container + Component + mocked HTTP.

**E2E**: the complete system from the user's perspective. Only for critical flows. Slow and costly to maintain.

### What to test in each layer

| Layer | What to test | How |
|---|---|---|
| Domain (backend) | **Not tested directly**: always exercised through a Use Case. The only exception is a larger Domain Service you want to test on its own | Object Mothers with fake data to build the input data |
| Application (backend) | Use Cases | Unit: in-memory repository, mocked dependencies |
| Infrastructure (backend) | Repository implementations | Integration: real or in-memory database |
| Pod hooks (frontend) | State logic, handlers | Unit: render the hook in isolation |
| Mappers (frontend/backend) | Data transformation | Unit: pure function |
| Component (frontend) | Rendering, UI interactions | Integration: no real queries |
| Container (frontend) | Full flow with data | Integration: mocked HTTP |
| Critical flows | Registration, login, main action | E2E |

**Why the Domain is not tested directly**: aggregates and Value Objects make no sense tested in isolation: their behavior gains meaning in the context of a use case. If `Product.create()` throws a domain exception, that is verified in the test of the Use Case that invokes it, not in a unit test of `Product`. The only exception is a larger Domain Service you want to test on its own.

### Object Mother — test data

The Object Mother is the only way to build domain entities in tests. Never build ad-hoc test objects in each test.

The hierarchy has three levels. The fake-data library lives only in `MotherCreator`: if the library changes, only two places are touched: `MotherCreator` and the primitive-type Mothers.

```
MotherCreator          ← the fake-data library lives here. Single point of change of library.
      ↓
StringMother           ← semantic methods that call MotherCreator
UuidMother
NumberMother
      ↓
ProductIdMother      ← Mother of the VO, calls UuidMother
ProductNameMother   ← Mother of the VO, calls StringMother
      ↓
ProductMother        ← composes the Mothers of the VOs
```

The code of `MotherCreator`, `StringMother` and `UuidMother` depends on the fake-data library: it lives in the stack reference.

A Mother lives next to the test that uses it. Shared Mothers go in `test/shared`.

```ts
// apps/api/test/product/application/create/product-id-mother.ts
import { UuidMother } from '@test/shared/domain/uuid-mother';
import { ProductId } from '@/product/domain/product-id';

export class ProductIdMother {
  static random(): ProductId {
    return new ProductId(UuidMother.random());
  }

  static withValue(value: string): ProductId {
    return new ProductId(value);
  }
}
```

```ts
// apps/api/test/product/application/create/product-mother.ts
import { ProductIdMother } from './product-id-mother';
import { ProductNameMother } from './product-name-mother';
import { Product } from '@/product/domain/product';

export class ProductMother {
  static random(overrides?: Partial<ProductPrimitives>): Product {
    return Product.fromPrimitives({
      id: ProductIdMother.random().value,
      name: ProductNameMother.random().value,
      description: ProductNameMother.random().value,
      size: 'medium',
      ...overrides,
    });
  }

  static withSize(size: ProductSize): Product {
    return ProductMother.random({ size });
  }
}
```

Benefits:
- The fake-data library appears only in `MotherCreator`: changing library = a single file
- The primitive-type Mothers (`StringMother`, `UuidMother`) are the second point of change if the library's API changes
- Tests are readable, and domain changes are updated in a single place
- Random data detects edge cases that fixed data would not detect

### TDD rules in this project

- Tests are written **before** the implementation, not after.
- A test must have a single reason to fail.
- The test name describes the expected behavior, not the implementation: `it('throws ProductNotFound when product does not exist')`, not `it('calls repository.match')`.
- Do not mock what you do not control (do not mock `Date`, `Math.random` directly: use abstractions).
- A test that never fails proves nothing: verify that the test fails before implementing.

---

## 4. Separation of Concerns

**Each module, class or function has a clearly delimited responsibility. What changes together lives together. What changes for different reasons lives apart.**

Concrete manifestations in the project:

| Concern                       | Where it lives                                 |
| ----------------------------- | ---------------------------------------------- |
| Business rules                | Domain (backend)                               |
| Use case orchestration        | Application (backend)                          |
| Protocol and infra details    | Infrastructure (backend)                       |
| Server state and cache        | Server-state library / api hooks (frontend)    |
| UI state                      | Pod hooks / Component (frontend)               |
| Routing and global context    | Container (frontend)                           |
| Data transformation           | Mappers (frontend and backend)                 |

---

## 5. Composition Root

**Dependencies are assembled at a single point of the system.** Classes do not create their own dependencies: they receive them.

**Why it matters**: if each class instantiates its dependencies, the system is impossible to test and to modify. The Composition Root is the only place that knows the concrete implementations.

In the backend: the DI container (framework module, `container.ts`, etc.) is the Composition Root.

In the frontend: the query client, the client-store providers and the context wrappers are the Composition Root. Components never instantiate services directly.

---

## 6. Immutability by default

**Prefer immutable structures. Mutate state only when necessary and explicitly.**

- Value Objects are immutable. An operation on a VO returns a new one, it does not modify the existing one.
- In the frontend, hook state is updated through the handlers, never by mutating it directly.
- DTOs and ViewModels are read-only (`Readonly<T>` or `as const` where applicable).

**Why it matters**: unexpected mutability is one of the most common sources of bugs that are hard to reproduce. Immutability makes the data flow predictable.

---

## 7. Explicit over implicit

**Make things explicit even if it is more verbose.** Hidden effects, magic and undocumented conventions are technical debt.

- Types are explicit: no `any`, no inference when the type is not obvious.
- Contracts between layers (DTOs, interfaces, props) are explicit: no generic objects.
- Errors are thrown explicitly with concrete types: no strings, no `console.error`.
- In the frontend, Component props have an explicit interface: no `props: any`, no untyped spread.
