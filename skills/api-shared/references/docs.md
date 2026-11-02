# api-shared — Docs & References

## Related Skills

| Skill | Why read it |
|---|---|
| `api-di` | How to use the tokens SharedModule exposes (`LOGGER_SERVICE`, `EVENT_BUS`, etc.) |
| `api-infrastructure` | Each BC's modules — imported in `AppModule` together with `SharedModule` |
| `api-criteria` | `Criteria` lives in `shared/domain/` |
| `api-observability` | The logger adapter is registered in `SharedModule` |

For DTO validation in controllers, see `api-validation`.

## Internal Docs

| Doc | Relevant content |
|---|---|
| `docs/engineering/backend-architecture.md` | What goes in SharedModule vs. what goes in each BC module |
| `docs/engineering/engineering-principles.md` | DRY vs. coupling — when something deserves to be shared and when it does not |
