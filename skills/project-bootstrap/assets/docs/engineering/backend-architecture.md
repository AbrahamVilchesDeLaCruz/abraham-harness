# Backend Architecture — DDD + Onion Architecture

> Architecture principles and rules of the myapp backend (`apps/api/`).
> For implementation conventions specific to the stack, see the skills in `apps/api/AGENTS.md`, and read `references/engineering-backend-architecture.md` in the stack skills that match this project's stack table.

---

## Fundamental principle

**Dependencies always point inward. Inner layers know nothing about outer ones. Never.**

```
┌─────────────────────────────────────┐
│         Infrastructure              │
│   ┌─────────────────────────────┐   │
│   │      Application            │   │
│   │   ┌─────────────────────┐   │   │
│   │   │      Domain         │   │   │
│   │   └─────────────────────┘   │   │
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

| From \ To      | Domain | Application | Infrastructure |
| -------------- | ------ | ----------- | -------------- |
| Domain         | ✅     | ❌          | ❌             |
| Application    | ✅     | ✅          | ❌             |
| Infrastructure | ✅     | ✅          | ✅             |

---

## Applied DDD principles

**Ubiquitous Language** — The names in the code reflect the language of the domain. If the business says "product", the code says `Product`, not `Card`, not `Item`, not `Entity`.

**Bounded Contexts** — Mental and code unit that represents a part of the business. Each context has its own language, its own models, and shares no implementations with other contexts.

**Aggregates** — The Aggregate Root is the only entry door to the domain. It guarantees invariants and internal consistency. Outer layers access the domain only through the aggregate or through domain services.

**Ports & Adapters** — the DDD name for [DIP](./engineering-principles.md#d--dependency-inversion-principle). The domain defines interfaces; the infrastructure implements them.

**Domain Events** — Facts that already happened in the system, expressed in the past tense (`ProductCreated`, `ReviewSubmitted`). They allow communication between Bounded Contexts without direct coupling.

**Modules** — Domain concept included within a Bounded Context. When a Bounded Context has multiple cohesive concepts, they are divided into modules. When it has only one, module = context.

---

## Layers

### Domain — the innermost layer

Zero external dependencies. Only the pure programming language.

**Aggregates** — groups of entities and Value Objects with a root that guarantees invariants. They are the entry door to the domain. They expose factory methods (`create`, `fromPrimitives`) and `toPrimitives`.

**Entities** — sets of Value Objects that make sense as a group and verify business rules related among them.

**Value Objects** — immutable, with no identity, with their own validation. They represent domain concepts with rules (`ProductId`, `ReviewScore`, `ImageUrl`).

**Repository interfaces (Ports)** — contracts that the infrastructure implements. They are not DAOs. They do not grow with query-specific methods. Allowed methods: `match`, `search`, `save`, `remove`.

**Domain Services** — logic that does not belong to a single entity and is needed from more than one use case. Example: `ProductExistVerifier` used from creator, updater and remover.

**Domain Events** — facts of the system expressed in the past tense. The aggregate records them; the infrastructure publishes them.

**Domain Exceptions** — business errors. They are not HTTP errors. The infrastructure maps them to protocol responses.

### Application — orchestration

It imports only from the domain. It knows nothing about frameworks, databases or protocols.

**Use Cases** — one file = one action of the system. They orchestrate aggregates, domain services and the repository. They receive primitives, and return primitives or void.

**DTOs** — transfer objects between layers. They are not domain entities. They define the input and output contract of each use case.

**Event Handlers / Consumers** — they react to Domain Events by executing use cases. One handler = one reaction to an event. They are derived use cases.

### Infrastructure — the outside world

The entry layer to the application. It implements the ports defined in the domain.

**Controllers** — they orchestrate use cases. They receive the protocol request (HTTP, messaging, etc.), build the DTO, call the use case, return the response.

**Repository implementations** — they implement the domain interface using the concrete persistence mechanism (SQL, NoSQL, in-memory).

**Mappers** — they transform between the persistence model and the domain, and vice versa. `toDomain` and `toPersistence`.

**Dependency Injection** — the [Composition Root](./engineering-principles.md#5-composition-root) of the backend. It registers and connects the implementations with the interfaces. It is infrastructure because it is a detail of how the system is assembled.

**Exception registry** — maps domain exceptions to protocol responses. The domain throws a semantic exception; the infrastructure converts it into HTTP 404, 409, etc.

**Event Bus** — publishes Domain Events to the outside (messaging, in-process). It implements the interface defined in domain or application.

**Infrastructure Services** — services that need no interface in the domain (cache, rate-limiting, security, external storage). They may have an interface in the domain if the domain needs to abstract itself from them.

---

## Folder structure

Bounded Contexts live directly under `src/`: there is no `contexts/` wrapper.

```
src/
├── {bounded-context}/
├── shared/                          ← global shared of the system
│   ├── domain/                      ← base AggregateRoot, base VO, global interfaces (Logger)
│   ├── application/                 ← base Subscriber, handler interfaces
│   └── infrastructure/              ← DB connection, EventBus impl, Criteria, DI container, Logger impl
└── observability/                   ← cross-cutting technical module (not a domain BC)
    ├── application/summary/         ← read port + MetricsSummaryRetriever (admin JSON)
    └── infrastructure/
        ├── controllers/             ← metrics-get + search-metrics-summary-get
        ├── metrics.interceptor.ts   ← MetricsInterceptor
        └── framework/
            └── observability.module.ts
```

### Bounded Context = Module (simple case)

When a Bounded Context has a single concept, module and context collapse. Real examples: `sales/`, `progress/`.

```
src/
└── sales/                    ← context = module
    ├── application/
    │   └── {verb}/            ← action (start, complete, record, update)
    │       ├── {use-case}     ← OrderStarter
    │       ├── request-{dto}
    │       └── response-{dto}
    ├── domain/
    │   ├── events/
    │   ├── exceptions/
    │   ├── {aggregate}        ← Aggregate Root
    │   ├── {aggregate}.repository
    │   └── {aggregate}-{vo}
    └── infrastructure/
        ├── controllers/
        ├── persistence/       ← repository implementation + mappers + persistence entities
        ├── selectors/         ← optimized read queries (if applicable)
        └── framework/         ← module + exception registry + DI providers; this module plays both roles of the next section
```

### Bounded Context with multiple modules

When a BC groups several cohesive concepts, each one has its own module, and the BC works almost as a modular monolith. Real examples: `content/` (with `product/`), `identity/` (with `user/` and `session/`).

```
src/
└── content/                         ← bounded context
    ├── product/                   ← module
    │   ├── application/
    │   │   └── {verb}/
    │   ├── domain/
    │   │   ├── events/
    │   │   ├── exceptions/
    │   │   ├── {aggregate}
    │   │   ├── {aggregate}.repository
    │   │   └── {aggregate}-{vo}
    │   └── infrastructure/
    │       ├── controllers/
    │       ├── framework/           ← product.module.ts + product-exception-registry.ts + DI providers
    │       ├── persistence/
    │       └── {external-service}/  ← e.g.: ai/, image/ (adapters of external services)
    └── shared/                      ← shared of the bounded context
        ├── domain/
        ├── application/
        └── infrastructure/
            └── framework/           ← content-shared.module.ts: gathers the modules and their registries
```

Each module exports its own exception registry. The shared module of the bounded context gathers them, and it is what reaches the root shared module. The root shared module receives only the shared modules of the bounded contexts, never a module directly.

---

## Naming rules

| Element              | Convention                            | Example                                          |
| -------------------- | ------------------------------------- | ------------------------------------------------ |
| Bounded Context      | singular or compound                  | `content/`, `sales/`, `identity/`, `progress/`   |
| Module               | singular                              | `product/`, `user/`, `session/`                  |
| Domain files         | always singular                       | `product.ts`, `product-id.ts`                    |
| Use Case             | `{Module}{Verb}`                      | `ProductCreator`, `OrderStarter`                 |
| Domain Event         | `{Module}{ActionPast}Event`           | `ProductCreatedEvent`, `PaymentRecordedEvent`    |
| Domain Exception     | `{Module}{Problem}`                   | `ProductNotFound`, `OrderNotFound`               |
| Repository interface | `{Module}Repository`                  | `ProductRepository`, `OrderRepository`           |
| Domain Service       | `{Module}{Concern}`                   | `ProductExistVerifier`                           |
| Controller           | `{Verb}{Module}{Method}Controller`    | `CreateProductPostController`, `GetOrderGetController` |
| Repository impl      | `{Tech}{Module}Repository`            | `SqlProductRepository`                           |
| Mapper               | `{Module}Mapper`                      | `ProductMapper`                                  |
| Subscriber           | `{Verb}{Module}On{Event}`             | `UpdateProductStatsOnPaymentRecorded`            |

---

## Domain invariants

The aggregate is the only one that can guarantee invariants. Rules:

- **Law of Demeter** — an object only talks to its direct collaborators. Do not chain calls through objects.
- **Tell, don't ask** — tell the object what to do, do not ask for its state to decide outside.
- **Separation of Concerns** — each class has a single reason to change.
- **Factory methods** — the aggregate is built only through `create()` or `fromPrimitives()`. Private constructor.
- **toPrimitives** — the only way to serialize the aggregate outward. Do not expose Value Objects directly to infrastructure.

---

## Communication between Bounded Contexts

- Bounded Contexts **do not import each other directly**
- Communication only through **Domain Events** (asynchronous) or the **Shared module** (common interfaces and types)
- An event published by context A is consumed by context B without A knowing that B exists
- Synchronous communication between contexts is a smell: a sign that the boundaries are badly defined

---

## Shared Module

It contains knowledge shared across the whole system:

- **Domain**: base AggregateRoot, Value Object bases, global interfaces (EventBus, Criteria, Logger)
- **Application**: base use cases, handler interfaces
- **Infrastructure**: database connection, EventBus implementation, Criteria, DI container, Logger implementation

Rule: if something is used by **more than one bounded context**, it goes to shared. If only one uses it, it belongs to the module.

---

## Observability Module

Cross-cutting technical module: it is not a domain Bounded Context but platform infrastructure.

Responsibilities:
- **`MetricsInterceptor`** — intercepts each HTTP request and records duration and count in the metrics library
- **`MetricsGetController`** — exposes `GET /metrics` so that the metrics collector can scrape it
- **`SearchMetricsSummaryGetController`** — exposes `GET /v1/metrics/summary` (admin, JSON envelope)
- **Observability module** — registers the metrics registry, the global interceptor and the controllers

It has no `domain/` layer: it is technical infrastructure with a read slice in `application/summary/`.

The `METRICS_REGISTRY` and `APP_METRICS` tokens live in `shared/domain/`. The metrics implementation implements `AppMetrics` in `shared/infrastructure/metrics/`.
