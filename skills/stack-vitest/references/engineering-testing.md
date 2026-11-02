# Vitest — client tests in the project rules

Vitest details for the concepts in the client `AGENTS.md`.

**Vitest config:** `vitest.config.ts` — intentionally separate from `vite.config.ts`.
**Setup:** `src/test/setup.ts` — imports `@testing-library/jest-dom`.

Project commands with these tools:

- `pnpm test` runs Vitest once.
- `pnpm test:cov` runs Vitest + coverage.
- `pnpm test:ui` opens the Vitest UI in the browser (interactive visualization).
- `pnpm test:e2e` runs Playwright (requires prior installation).
- `pnpm test:e2e:ui` runs Playwright with its interactive UI.
- `pnpm test:ci` runs Vitest + coverage + verbose (GitHub Actions).
- `pnpm test:e2e:ci` runs Playwright `--reporter=github` (GitHub Actions).

`client-testing` covers Vitest + RTL (unit/integration), Playwright E2E and MSW.
