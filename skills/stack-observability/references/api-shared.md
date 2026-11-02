# api-shared with pino

The concept skill `api-shared` defines the rules.

- `LOGGER_SERVICE` is implemented by `PinoLogger` (structured logger), in `shared/infrastructure/logger/pino-logger.ts`, and `api-observability` registers it in `SharedModule`.

The concept skill's log store URL is `LOKI_URL`.
