Objective: align the stack skills with current official templates, solve the Nest build with TypeScript 7, and add a shared Makefile convention. Branch: feat/vitest-oxlint-make.
Delivery: single-pr. Test runner: node --test.

## Specs

- S1. Accepted recommendation: scaffolding keeps what the official CLI generates, and never replaces it from a guide.
- S2. Accepted recommendation: Vitest also for the API, removing `stack-jest` (Jest, `ts-jest`, `jest-mock-extended`). Object Mothers and `api-testing` stay framework-free.
- S3. Accepted recommendation: oxlint instead of ESLint, keeping Prettier as the template brings it.
- S4. Accepted recommendation: the newest TypeScript the app's CLI accepts, with no version fixed in skills.
- S5. Observed: with the current Nest CLI, `nest build` rejects TypeScript 7, including 7.1 beta, because the compiler API is missing. Application code, DI metadata through `tsc`, Vitest and oxlint work on TypeScript 7. `typescript@6` plus an alias of `typescript@7` keeps `nest build` working, and gives a fast type check.
- S6. "también me gustaría una skill para makefiles (que tengan el help, local, dev, prod, etc) así puedo levantarlo todo el docker desde un comando más sencillo. para que todos los makefiles sean iguales."

## Tasks

- [x] T1 S1-S5 stack skills. Route: delegated, parallel unit with T2.
- [x] T2 S6 Makefile skill and templates. Route: inline.
- [ ] T3 independent verification. Risk: item 6, and item 5 for build tooling guidance.

## Log

- L1 (2026-11-03): "también me gustaría una skill para makefiles (que tengan el help, local, dev, prod, etc) así puedo levantarlo todo el docker desde un comando más sencillo. para que todos los makefiles sean iguales. y si, haz el cambio que me recomiendas. Lo que además cómo solucionaríamos lo del nest build?"
- L2: Engram mirror pending: no Engram tool is available in this session.
- L3 (2026-11-03): "vale hagamos así". `update` refreshes `make/local.mk`, `dev.mk`, `prod.mk` and `code.mk`. It never touches the root `Makefile` or `make/project.mk`. A module edited by hand is kept and reported.
