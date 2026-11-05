# api-infrastructure with TypeORM

The concept skill `api-infrastructure` defines the rules. This reference maps persistence entities and module wiring to TypeORM; repository behavior is in `api-repository` and `references/api-repository.md`.

## Entity rules

- Entities use the `Entity` suffix and live under `infrastructure/persistence/`.
- Use plural `snake_case` table names. Map `snake_case` column names explicitly while keeping `camelCase` properties in TypeScript.
- Keep nullable fields and database defaults explicit in the mapping. Entities never leave the persistence adapter.

```typescript
@Entity('orders')
export class OrderEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true, type: 'uuid' })
  userId: string | null;

  @Column({ default: 'in_progress' })
  status: string;

  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt: Date;
}
```

## Module registration

Import the entity in the bounded-context persistence/framework module and register the adapter using the repository port's DI token. Read `stack-nestjs/references/api-infrastructure.md` for module wiring.

## External documentation

- [TypeORM — Entity](https://typeorm.io/entities) — entity and column mappings.
