# Payload & Query Templates

These are framework-free versions. Validation and documentation decorators live in the project's stack skill, in `references/api-validation.md`.

## POST / PATCH Payload

File: `{context}/infrastructure/controllers/{verb}-{entity}-{method}.payload.ts`

```typescript
export class {Verb}{Entity}{Method}Payload {
  requiredField: string;

  optionalField?: string;

  enumField: SomeEnum;

  numericField: number;

  idField: string;
}
```

## GET Query

File: `{context}/infrastructure/controllers/{verb}-{entity}-get.query.ts`

```typescript
export class {Verb}{Entity}GetQuery {
  page?: number = 1;

  limit?: number = 20;

  status?: SomeStatusEnum;

  search?: string;
}
```

## Rules reminder

- Number coercion **only in Query** — query params arrive as strings from HTTP
- Never coerce types in Payloads — JSON bodies already arrive typed
- Optional validation for simple optional fields
- Conditional validation for complex conditional validations
- API documentation on all fields — it is required
