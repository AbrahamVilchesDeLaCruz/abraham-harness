# Test runtime at project bootstrap

The shared `make test-e2e` target calls the root package's `test:e2e` script. Configure that root script as the one E2E orchestrator. It must return a failing status when a configured suite fails and must not call `make test-e2e` again.

For a project with an API, create a test Dockerfile target and `docker-compose.test.yml` using the stack testing reference. The root script starts the disposable Compose environment with `docker compose -f docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from api-test`. The runner waits for the test database, runs API unit tests once and then the API package's `test:e2e` script. That package script runs only its E2E test runner; it never calls the root script. The database starts once for the run and uses ephemeral storage.

When a client exists, the root script also runs its unit suite once and its complete browser E2E suite. Provide the browser suite's required frontend and backend test services for the duration of that suite; the API test Compose run above stops when `api-test` exits and is not a persistent browser backend. A client-only project uses a root script that runs its checks without starting the API test Compose environment. The complete root run must cover every configured unit and E2E scope once. Do not create a duplicate `test-e2e` target in `make/project.mk`.

Check the root script and its package-level commands with the project stack skills. Use `make -n test-e2e` to confirm the shared target reaches the root script once, then run the real command against a disposable environment. Configure CI to run the complete unit and E2E suite as its publication check.
