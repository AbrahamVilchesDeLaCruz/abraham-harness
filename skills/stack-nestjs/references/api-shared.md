# api-shared with NestJS

The concept skill `api-shared` defines the rules. This reference shows how to apply them with NestJS and Joi.

## Rules

- `SharedModule` is imported **only once** in `AppModule` — it is `@Global()`.
- `ConfigModule.forRoot()` and `TypeOrmModule.forRootAsync()` are configured in **`AppModule`**, not in `SharedModule`.
- `ConfigModule` is declared `isGlobal: true` so `ConfigService` is available in all modules.
- `SharedModule` does not import or re-export `ConfigModule` or `TypeOrmModule`.
- `abortEarly: false` always — see all errors at once.
- `.required()` in everything that has no default — fails at bootstrap, not at runtime.
- **Joi for env** — not Zod. It is the native integration of `@nestjs/config`.
- Configuration lives in `ConfigModule.forRoot()` **in `AppModule`**, not in `SharedModule`.
- `HttpExceptionFilter` is the global HTTP filter (via `APP_FILTER`).

## Why Joi and not Zod for env validation

`@nestjs/config` integrates natively with Joi via `validationSchema` in `ConfigModule.forRoot()`. Using Zod would require an additional wrapper. For this specific case (validation at bootstrap, not at runtime), Joi is the option with the least friction.

For DTO validation in controllers, use `class-validator` (see `api-validation`).

## Structure

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
        │   ├── inbox/                   ← ProcessedEventEntity, TypeOrmProcessedEventsRepository
        │   ├── migrations/
        │   └── typeorm/
        │       ├── typeorm-data-source-options.ts  ← buildTypeOrmDataSourceOptions()
        │       └── typeorm.config.cli.ts
        ├── config/
        │   ├── env.validation.ts        ← Joi schema
        │   └── use-stub-adapters.ts
        ├── framework/
        │   └── shared.module.ts         ← @Global() — imported ONCE in AppModule
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

## Global `SharedModule` complete

```typescript
// src/shared/infrastructure/framework/shared.module.ts
import { Global, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { LOGGER_SERVICE } from '@/shared/domain/logger';
import { DOMAIN_EVENT_PUBLISHER } from '@/shared/domain/domain-event-publisher';
import { DOMAIN_EVENT_CONSUMER } from '@/shared/application/domain-event-consumer';
import { HealthGetController } from '../controllers/health-get.controller';
import { PinoLogger } from '../logger/pino-logger';
import { GlobalExceptionRegistry } from '../exceptions/global-exception-registry';
import { HttpExceptionFilter } from '../exceptions/http-exception.filter';
import { AmqpMessageBus } from '../event-bus/amqp-message-bus';

@Global()
@Module({
  controllers: [HealthGetController],
  providers: [
    {
      provide: LOGGER_SERVICE,
      useClass: PinoLogger,
    },
    GlobalExceptionRegistry,
    HttpExceptionFilter,
    {
      provide: APP_FILTER,
      useExisting: HttpExceptionFilter,
    },
    // Event bus — singleton shared by all modules
    AmqpMessageBus,
    { provide: DOMAIN_EVENT_PUBLISHER, useExisting: AmqpMessageBus },
    { provide: DOMAIN_EVENT_CONSUMER, useExisting: AmqpMessageBus },
  ],
  exports: [
    LOGGER_SERVICE,
    GlobalExceptionRegistry,
    HttpExceptionFilter,
    DOMAIN_EVENT_PUBLISHER,
    DOMAIN_EVENT_CONSUMER,
  ],
})
export class SharedModule {}
```

> **Important**: `SharedModule` does **not** contain `ConfigModule` or `TypeOrmModule`.
> They are configured in `AppModule` (see the next section).

## `AppModule` — ConfigModule + TypeORM + global wiring

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'node:path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { SharedModule } from './shared/infrastructure/framework/shared.module';
import { buildTypeOrmDataSourceOptions } from './shared/infrastructure/persistence/typeorm/typeorm-data-source-options';
import { envValidationSchema } from './shared/infrastructure/config/env.validation';
// ... BC modules

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(process.cwd(), '.env.local'),
        join(process.cwd(), '.env'),
      ],
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => buildTypeOrmDataSourceOptions(),
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 100,
        skipIf: (): boolean => process.env.NODE_ENV === 'test',
      },
      {
        name: 'auth',
        ttl: 60_000,
        limit: 10,
        skipIf: (): boolean => process.env.NODE_ENV === 'test',
      },
    ]),
    SharedModule,
    // IdentityModule, CatalogModule, SalesModule, ...
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

## Complete Bounded Context Module

BC modules are complete NestJS modules that wire the whole BC: repositories, use cases, controllers, subscribers and the exception registry. They live in `{bc}/shared/infrastructure/framework/`.

```typescript
// src/achievement/shared/infrastructure/framework/achievement.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '@/shared/infrastructure/framework/shared.module';
import { AuthModule } from '@/shared/infrastructure/auth/auth.module';
import { SUBSCRIBERS, SubscribersBootstrapper } from '@/shared/infrastructure/event-bus/subscribers-bootstrapper';

import { USER_ACHIEVEMENT_REPOSITORY } from '@/achievement/user-achievement/domain/user-achievement.repository';
import { USER_ACHIEVEMENT_PROGRESS_REPOSITORY } from '@/achievement/progress/domain/user-achievement-progress.repository';
import { UserAchievementEntity } from '@/achievement/user-achievement/infrastructure/persistence/user-achievement.entity';
import { UserAchievementProgressEntity } from '@/achievement/progress/infrastructure/persistence/user-achievement-progress.entity';
import { TypeOrmUserAchievementRepository } from '@/achievement/user-achievement/infrastructure/persistence/typeorm-user-achievement.repository';
import { TypeOrmUserAchievementProgressRepository } from '@/achievement/progress/infrastructure/persistence/typeorm-user-achievement-progress.repository';

import { AchievementCatalog } from '@/achievement/catalog/domain/achievement-catalog';
import { AchievementsSearcher } from '@/achievement/user-achievement/application/search/achievements-searcher';
import { SearchAchievementsGetController } from '@/achievement/user-achievement/infrastructure/controllers/search-achievements-get.controller';
import { AchievementExceptionRegistry } from './achievement-exception-registry';
// ... more use cases and subscribers

@Module({
  imports: [
    SharedModule,
    AuthModule,
    TypeOrmModule.forFeature([
      UserAchievementEntity,
      UserAchievementProgressEntity,
    ]),
  ],
  controllers: [SearchAchievementsGetController],
  providers: [
    // Repositories — registered with a DI token
    { provide: USER_ACHIEVEMENT_REPOSITORY, useClass: TypeOrmUserAchievementRepository },
    { provide: USER_ACHIEVEMENT_PROGRESS_REPOSITORY, useClass: TypeOrmUserAchievementProgressRepository },

    // Domain services
    AchievementCatalog,

    // Use cases
    AchievementsSearcher,

    // Subscribers — wired via useFactory
    {
      provide: SUBSCRIBERS,
      useFactory: (/* ...subscribers */): Subscriber[] => [/* ... */],
      inject: [/* ... */],
    },
    SubscribersBootstrapper,

    // BC exception registry
    AchievementExceptionRegistry,
  ],
  exports: [
    AchievementCatalog,           // domain service — needed by other BCs
    USER_ACHIEVEMENT_REPOSITORY,  // repository token — never the concrete implementation
  ],
})
export class AchievementModule {}
```

**Keys of the BC module pattern:**
- Imports `SharedModule` and `AuthModule` (does not declare them global)
- Registers its entities with `TypeOrmModule.forFeature([...])`
- Uses tokens (`PRODUCT_REPOSITORY`, `LOGGER_SERVICE`) — never concrete classes directly in `inject`
- Exports only what other BCs need — DI tokens or domain services

## Env Validation — Joi (essentials)

```typescript
// src/shared/infrastructure/config/env.validation.ts
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  PORT: Joi.number().default(3000),
  // ... see the complete schema in this document
});
```

## Complete `env.validation.ts` — Joi schema

```typescript
// src/shared/infrastructure/config/env.validation.ts
import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // App
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  PORT: Joi.number().default(3000),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:4001'),
  CORS_ORIGIN: Joi.string().default('http://localhost:4001,http://localhost:5173'),
  USE_STUB_ADAPTERS: Joi.boolean()
    .truthy('true', '1', 1)
    .falsy('false', '0', 0)
    .default(false),

  // Database — a single URL with all the credentials
  DATABASE_URL: Joi.string().required(),
  DATABASE_CA_CERT: Joi.string().optional(),

  // Auth
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),

  // Google OAuth
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_CALLBACK_URL: Joi.string().uri().required(),

  // RabbitMQ — AMQP_URI (no RABBITMQ_URL)
  AMQP_URI: Joi.string().required(),
  EMAIL_PROVIDER_API_KEY: Joi.string().required(),
  CLOUD_STORAGE: Joi.string().uri().required(),
  CLOUD_STORAGE_PUBLIC_URL: Joi.string().uri().required(),
  CLOUD_STORAGE_ACCESS_KEY_ID: Joi.string().required(),
  CLOUD_STORAGE_SECRET_ACCESS_KEY: Joi.string().required(),
  CLOUD_STORAGE_BUCKET: Joi.string().required(),

  // Observability
  LOKI_URL: Joi.string().uri().optional(),
  LOG_LEVEL: Joi.string()
    .valid('trace', 'debug', 'info', 'warn', 'error', 'fatal')
    .default('info'),
});
```

## External Documentation

- [NestJS — Configuration](https://docs.nestjs.com/techniques/configuration) — `ConfigModule`, `ConfigService`
- [NestJS — Global Modules](https://docs.nestjs.com/modules#global-modules) — `@Global()` and its implications
- [Joi — Validation](https://joi.dev/api/) — schema validation for env vars

The concept skill uses neutral wording: the shared module is `SharedModule`, the application root module is `AppModule`, and the auth module is `AuthModule`.
