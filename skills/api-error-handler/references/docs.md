# api-error-handler — Docs & References

## Related Skills

| Skill | Why read it |
|---|---|
| `api-domain` | Domain Errors — how they are defined with the `DomainError` base class |
| `api-infrastructure` | Where to register the `ExceptionRegistry` in the module |
| `api-response` | Error response format vs successful response |
| `api-shared` | `GlobalExceptionRegistry` lives in the shared module, and how a bounded context's shared module reaches it |

## External Documentation

- [HTTP Status Codes — MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) — complete reference of status codes

## Error Response Envelope

```json
{
  "statusCode": 404,
  "message": "Order with id <abc123> not found",
  "errorType": "OrderNotFound",
  "path": "/api/orders/abc123",
  "timestamp": "2026-05-21T12:00:00.000Z"
}
```

`HttpExceptionFilter` generates this format automatically — do not build it manually in controllers.

- `statusCode`: numeric HTTP status code
- `message`: error message (domain error string, or response body if it is a framework HTTP exception)
- `errorType`: exception class name (only for domain errors; `null` for framework HTTP exceptions)
- `path`: request URL
- `timestamp`: ISO 8601

## Internal Docs

| Doc | Relevant content |
|---|---|
| `backend-architecture.md` in `engineering-conventions` | Domain errors are thrown in Domain, mapped to HTTP in Infrastructure |
| `engineering-principles.md` in `engineering-conventions` | SRP — the DomainError→HTTP mapping is an exclusive responsibility of the exception registry |
