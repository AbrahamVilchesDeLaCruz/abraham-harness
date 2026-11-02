# Shared: estructura y env

## Structure

```
src/
└── shared/
    ├── domain/
    │   ├── criteria.ts                  ← Criteria (pure domain, un solo archivo)
    │   ├── aggregate-root.ts
    │   ├── domain-event.ts
    │   ├── domain-event-publisher.ts    ← interface del EventBus (port)
    │   ├── logger.ts                    ← interface del Logger (port)
    │   ├── value-object.ts
    │   ├── string-value-object.ts
    │   ├── uuid-value-object.ts
    │   ├── user-id.ts
    │   ├── product-id.ts
    │   └── exceptions/                  ← excepciones de dominio transversales
    ├── application/
    │   ├── subscriber.ts                ← abstract Subscriber
    │   └── domain-event-consumer.ts     ← interface del consumer
    └── infrastructure/
        ├── persistence/
        │   ├── inbox/                   ← ProcessedEventEntity, TypeOrmProcessedEventsRepository
        │   ├── migrations/
        │   └── typeorm/
        │       ├── typeorm-data-source-options.ts  ← buildTypeOrmDataSourceOptions()
        │       └── typeorm.config.cli.ts
        ├── config/
        │   ├── env.validation.ts        ← Joi schema
        │   └── use-stub-adapters.ts
        ├── framework/
        │   └── shared.module.ts         ← @Global() — se importa UNA vez en AppModule
        ├── auth/
        │   └── auth.module.ts           ← JWT + Google + Guest strategies
        ├── event-bus/
        │   ├── amqp-message-bus.ts      ← implements DOMAIN_EVENT_PUBLISHER + DOMAIN_EVENT_CONSUMER
        │   └── subscribers-bootstrapper.ts
        ├── exceptions/
        │   ├── global-exception-registry.ts
        │   └── http-exception.filter.ts
        └── logger/
            └── pino-logger.ts           ← implements LOGGER_SERVICE
```

### Shared interno por bounded context

```
src/
└── achievement/
    └── shared/
        ├── domain/
        │   ├── achievement-key.ts          ← VO compartido entre submódulos
        │   ├── achievement-category.ts     ← VO compartido
        │   └── exceptions/                 ← errores de dominio del BC
        └── infrastructure/
            └── framework/
                ├── achievement.module.ts           ← NestJS module del BC completo
                └── achievement-exception-registry.ts
```

## Env Validation — Joi (esencial)

```typescript
// src/shared/infrastructure/config/env.validation.ts
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  PORT: Joi.number().default(3000),
  // ... ver references/module-patterns.md para schema completo
});
```
