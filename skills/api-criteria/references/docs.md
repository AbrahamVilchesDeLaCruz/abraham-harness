# api-criteria — Docs & References

## Related Skills

| Skill | Why read it |
|---|---|
| `api-infrastructure` | `match()` in persistence repositories — implementation with a query builder |
| `api-application` | Use cases — where `Criteria` is built |
| `api-shared` | `Criteria` lives in `shared/domain/` |
| `api-validation` | Query DTOs — where filters and pagination come from |

## Pattern Origin

The Criteria pattern is a way to encapsulate the parameters of a query in a domain object. It lets the use case express *what* it wants to search for without depending on the details of the persistence infrastructure.

Reference: [Specification Pattern — Martin Fowler](https://martinfowler.com/apsupp/spec.pdf) (simplified version without boolean composition)

## SQL Injection Safety

The query builder uses named parameters (`:param`) — never string interpolation. This prevents SQL injection:

```typescript
// ✅ Safe — parameterized
query.addCondition(`g.${filter.field} = :status`, { status: filter.value });

// ❌ Vulnerable — direct interpolation
query.addCondition(`g.status = '${filter.value}'`);
```

## Internal Docs

| Doc | Relevant content |
|---|---|
| `backend-architecture.md` in `engineering-conventions` | Why `Criteria` lives in Domain (cross-cutting, no infrastructure dependencies) |
