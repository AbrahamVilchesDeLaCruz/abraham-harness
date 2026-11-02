# api-di — Docs & References

## Related Skills

| Skill | Por qué leerla |
|---|---|
| `api-shared` | `SharedModule` global — cómo se registran Logger, EventBus, DB |
| `api-infrastructure` | Estructura del módulo NestJS por bounded context |
| `api-application` | Cómo los use cases inyectan puertos con `@Inject(TOKEN)` |
| `api-events` | Tokens `EVENT_BUS` y `DOMAIN_EVENT_CONSUMER` |

## External Documentation

- [NestJS — Custom Providers](https://docs.nestjs.com/fundamentals/custom-providers) — `useClass`, `useFactory`, `useValue`, `useExisting`
- [NestJS — Injection Scopes](https://docs.nestjs.com/fundamentals/injection-scopes) — DEFAULT (singleton), REQUEST, TRANSIENT
- [NestJS — Circular Dependency](https://docs.nestjs.com/fundamentals/circular-dependency) — `forwardRef()` y cómo evitar necesitarlo

## Por qué Symbol y no string

```typescript
// ❌ String — colisiones entre módulos
{ provide: 'Repository', useClass: TypeOrmOrderRepository }
// ❌ Clase — acopla el use case a la implementación concreta
{ provide: TypeOrmOrderRepository, useClass: TypeOrmOrderRepository }

// ✅ Symbol — único, seguro, sin colisiones
export const ORDER_REPOSITORY = Symbol('OrderRepository');
{ provide: ORDER_REPOSITORY, useClass: TypeOrmOrderRepository }
```

## Internal Docs

| Doc | Contenido relevante |
|---|---|
| `docs/engineering/backend-architecture.md` | Inversión de dependencias — por qué el use case depende de interfaces, no de clases concretas |
| `docs/engineering/engineering-principles.md` | DIP (Dependency Inversion Principle) — el fundamento de los tokens Symbol |
