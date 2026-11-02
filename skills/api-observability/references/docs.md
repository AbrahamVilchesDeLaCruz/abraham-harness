# api-observability — Docs & References

## Related Skills

| Skill | Why read it |
|---|---|
| `api-shared` | The shared module — where the logger adapter is registered with `LOGGER_SERVICE` |
| `api-application` | Use cases — where the `Logger` is injected and used |
| `api-events` | Subscribers — where `info` is logged when processing and `error` when failing |
| `api-error-handler` | `HttpExceptionFilter` — where logging happens automatically |

## Rollout phases

| Phase | What | When |
|---|---|---|
| 1 | Structured JSON logs on stdout + metrics endpoint `/metrics` | Now — development |
| 2 | Log, metric and trace storage with dashboards | Before the production deploy |

## Structured logging format

The logger emits one line of JSON per log. Example:

```json
{"level":"info","time":"2026-05-21T12:00:00.000Z","productId":"abc123","name":"what is liaison","msg":"Product created"}
{"level":"error","time":"2026-05-21T12:00:01.000Z","productId":"abc123","provider":"external-provider","err":{"type":"Error","message":"timeout","stack":"..."},"msg":"Image generation failed"}
```
