# NestJS — testing.md in engineering-conventions

NestJS details for the concepts in `testing.md` in `engineering-conventions`.

## E2E tests

They start the complete NestJS app against a Postgres test DB and make real HTTP requests via `supertest`.

`test/setup-env.ts` loads `.env.test` before the NestJS bootstrap. `create-test-app.ts` bootstraps NestJS for E2E.

## Known gotchas

| Problem | Cause | Solution |
|---|---|---|
| `422` instead of `400` on validation | `errorHttpStatusCode: 422` in `ValidationPipe` | Expected: use 422 in the specs |
