# api-shared — Docs & References

## Related Skills

| Skill | Why read it |
|---|---|
| `api-di` | How to use the tokens the shared module exposes (`LOGGER_SERVICE`, `EVENT_BUS`, etc.) |
| `api-infrastructure` | Each BC's modules — gathered by the BC's shared module, which the root shared module imports |
| `api-criteria` | `Criteria` lives in `shared/domain/` |
| `api-observability` | The logger adapter is registered in the shared module |

For DTO validation in controllers, see `api-validation`.

## Internal Docs

| Doc | Relevant content |
|---|---|
| `docs/engineering/backend-architecture.md` | What goes in the shared module vs. what goes in each BC module |
| `docs/engineering/engineering-principles.md` | DRY vs. coupling — when something deserves to be shared and when it does not |
