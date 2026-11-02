# Shared: structure and env

## Structure

Framework-specific folders and files (persistence, event bus, logger, env schema) are in the full tree in the project's stack skill, in `references/api-shared.md`.

```
src/
└── shared/
    ├── domain/
    │   ├── criteria.ts                  ← Criteria (pure domain, a single file)
    │   ├── aggregate-root.ts
    │   ├── domain-event.ts
    │   ├── domain-event-publisher.ts    ← EventBus interface (port)
    │   ├── logger.ts                    ← Logger interface (port)
    │   ├── value-object.ts
    │   ├── string-value-object.ts
    │   ├── uuid-value-object.ts
    │   ├── user-id.ts
    │   ├── product-id.ts
    │   └── exceptions/                  ← cross-cutting domain errors
    ├── application/
    │   ├── subscriber.ts                ← abstract Subscriber
    │   └── domain-event-consumer.ts     ← consumer interface
    └── infrastructure/
        ├── persistence/
        │   ├── inbox/                   ← processed events entity and repository
        │   └── migrations/
        ├── config/
        │   ├── env.validation.ts        ← env schema
        │   └── use-stub-adapters.ts
        ├── framework/
        │   └── shared.module.ts         ← global — imported ONCE in AppModule
        ├── auth/
        │   └── auth.module.ts           ← JWT + Google + Guest strategies
        ├── event-bus/
        │   └── subscribers-bootstrapper.ts
        └── exceptions/
            ├── global-exception-registry.ts
            └── http-exception.filter.ts
```

### Internal shared per bounded context

```
src/
└── achievement/
    └── shared/
        ├── domain/
        │   ├── achievement-key.ts          ← value object shared between submodules
        │   ├── achievement-category.ts     ← shared value object
        │   └── exceptions/                 ← the BC's domain errors
        └── infrastructure/
            └── framework/
                ├── achievement.module.ts           ← framework module of the whole BC
                └── achievement-exception-registry.ts
```

## Env Validation (essentials)

The schema in `src/shared/infrastructure/config/env.validation.ts` requires `NODE_ENV` (`development`, `production`, `test`) and defaults `PORT` to `3000`. See `references/module-patterns.md` for all the variables.
