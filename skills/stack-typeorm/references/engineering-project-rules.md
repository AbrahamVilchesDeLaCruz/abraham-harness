# TypeORM — project rules

Project rules from the `AGENTS.md` templates that name TypeORM.

- **TypeORM** only in `infrastructure/persistence/`: never in domain or application.
- `infrastructure/persistence/` holds TypeORM entities + repositories.
- `api-infrastructure` covers controllers, TypeORM entities, repositories and modules.
- `api-migrations` covers creating TypeORM migrations or seeds: the TypeORM migrations format and idempotent seeds.
