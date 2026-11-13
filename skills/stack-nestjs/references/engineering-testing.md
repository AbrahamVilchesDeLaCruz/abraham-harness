# NestJS — testing.md in engineering-conventions

NestJS details for the concepts in `testing.md` in `engineering-conventions`.

## E2E tests

They cover controllers only. They start the complete NestJS app against the Postgres test DB and make real HTTP requests via `supertest`. The suites run inside the compose test environment (`Dockerfile` test target + `docker-compose.test.yml`), against one database that starts before the first test and is shared by all of them.

`test/setup-env.ts` loads `.env.test` before the NestJS bootstrap. `create-test-app.ts` bootstraps NestJS for E2E.

## Known gotchas

| Problem | Cause | Solution |
|---|---|---|
| `422` instead of `400` on validation | `errorHttpStatusCode: 422` in `ValidationPipe` | Expected: use 422 in the specs |
