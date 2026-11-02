# Infrastructure: estructura y anti-patterns

## Estructura de carpetas

```
infrastructure/
├── controllers/
│   ├── {verb}-{resource}-{method}.controller.ts
│   └── {verb}-{resource}-{method}.payload.ts
├── framework/        ← NestJS modules + exception registries
└── persistence/      ← TypeORM entities + repositories
```

## Anti-patterns

```typescript
// ❌ Un controller para todo el recurso
export class OrderController { }

// ❌ Payload pasando a application
async execute(payload: StartOrderPostPayload): Promise<void> {}

// ❌ match() que ignora Criteria
async match(criteria: Criteria): Promise<Order[]> {
  return this.repo.find(); // criteria ignorado
}

// ❌ TypeORM entity saliendo del repositorio
async search(id: OrderId): Promise<OrderEntity> { ... }

// ❌ Controller sin Swagger
@Post() async handler(@Body() body): Promise<void> {}
```
