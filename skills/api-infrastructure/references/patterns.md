# Infrastructure: structure and anti-patterns

## Folder structure

```
infrastructure/
├── controllers/
│   ├── {verb}-{resource}-{method}.controller.ts
│   └── {verb}-{resource}-{method}.payload.ts
├── framework/        ← framework modules + exception registries
└── persistence/      ← persistence entities + repositories
```

## Anti-patterns

```typescript
// ❌ One controller for the whole resource
export class OrderController { }

// ❌ Payload passing into application
async execute(payload: StartOrderPostPayload): Promise<void> {}

// ❌ match() that ignores Criteria
async match(criteria: Criteria): Promise<Order[]> {
  return this.repo.find(); // criteria ignored
}

// ❌ Persistence entity leaving the repository
async search(id: OrderId): Promise<OrderEntity> { ... }

```

A controller without API documentation is also an anti-pattern.
