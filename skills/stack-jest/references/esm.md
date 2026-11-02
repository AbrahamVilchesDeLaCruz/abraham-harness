# ADR: Jest + ESM + TypeScript — Problems and solutions

> **Context**: When configuring Jest for the project (NestJS, strict TypeScript, an ESM-only `@faker-js/faker`, `jest-mock-extended`) we ran into a chain of problems caused by mixing native ESM with the Jest runtime. This document gathers them all, explains the root cause and the adopted solution.

---

## Problem 1 — `@faker-js/faker` is ESM-only and Jest cannot transform it

**Symptom**

```
SyntaxError: Cannot use import statement in a module
```

Faker threw this error when imported from a spec because Jest (in CJS mode by default) did not know how to transform ESM modules from `node_modules`.

**Root cause**

Faker removed its CJS build. Jest in CommonJS mode cannot run native ESM without explicit configuration.

**Solution**

Enable Jest's experimental ESM runner via `vm-modules` and configure `ts-jest` in ESM mode:

```json
// package.json
"test": "NODE_OPTIONS=--experimental-vm-modules jest --config jest.config.ts"
```

```ts
// jest.config.ts
extensionsToTreatAsEsm: ['.ts'],
transform: {
  '^.+\\.(t|j)s$': ['ts-jest', { useESM: true, tsconfig: '<rootDir>/tsconfig.test.json' }],
},
```

---

## Problem 2 — `jest` and `ts-jest` on different majors are incompatible

**Symptom**

```
TypeError: Cannot read properties of undefined (reading 'createScriptFromCode')
```

or cryptic errors during transform initialization.

**Root cause**

A `ts-jest` major does not support the internal API of a newer `jest` major. Different majors are incompatible.

**Solution**

Pin all of them to the same major:

```json
"jest": "<same major>",
"ts-jest": "<same major>",
"@jest/globals": "<same major>",
"@types/jest": "<same major>"
```

---

## Problem 3 — `jest` global not available in ESM vm-modules

**Symptom**

```
ReferenceError: jest is not defined
```

When trying to use `jest.useFakeTimers()`, `jest.fn()`, etc. directly in the specs.

**Root cause**

In the ESM runner (`--experimental-vm-modules`), Jest **does not inject the `jest` object as a global**. It only injects `describe`, `it`, `expect`, `beforeEach`, `afterEach` — which come from `@types/jest` as global types, but `jest` itself is not available in the ESM module scope.

**Solution**

Import `jest` explicitly from `@jest/globals` when it is needed:

```ts
import { jest } from '@jest/globals';

jest.useFakeTimers().setSystemTime(new Date('2026-01-01T12:00:00Z'));
```

`describe`, `it`, `expect`, `beforeEach`, `afterEach` — do NOT import them, they are real globals.

---

## Problem 4 — A misconfigured `tsconfig.test.json` broke module resolution

**Symptom**

```
Cannot find module '@/identity/domain/user' from 'test/...'
```

Or `moduleResolution` errors when importing from `node_modules` with an `exports` map.

**Root cause**

The base `tsconfig.json` used `"module": "CommonJS"` and `"moduleResolution": "node"`. With `useESM: true` in ts-jest, TypeScript and Jest disagreed on how to resolve modules.

**Solution**

Create a specific `tsconfig.test.json` that extends the base and overrides only what is necessary:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "ES2022",
    "moduleResolution": "bundler",
    "resolvePackageJsonExports": false
  },
  "include": ["src/**/*", "test/**/*"]
}
```

- `module: ES2022` — enables real ESM imports
- `moduleResolution: bundler` — resolves path aliases (`@/`) correctly
- `resolvePackageJsonExports: false` — prevents TypeScript from enforcing the `exports` map of some packages that do not have it configured well for ESM
- `include` with both directories — required so that ts-jest transforms both `src/` and `test/`

---

## Problem 5 — NestJS packages (CJS) could not be loaded from an ESM context

**Symptom**

```
Must use import to load ES Module
```

or the reverse: NestJS decorators (`@Injectable`, `@Inject`) failed when imported.

**Root cause**

`@nestjs/common` and `@nestjs/core` ship CJS. Jest's ESM runner does not transform them by default because `transformIgnorePatterns` excludes all of `node_modules`.

**Solution**

Tune `transformIgnorePatterns` so that ts-jest **does transform** the NestJS packages:

```ts
transformIgnorePatterns: [
  '/node_modules/.pnpm/(?!(@nestjs\\+common|@nestjs\\+core|reflect-metadata))',
  '/node_modules/(?!(@nestjs)/)',
],
```

The double pattern is needed because pnpm uses a symlink structure under `.pnpm/` with the form `@nestjs+common@x.y.z`.

---

## Problem 6 — An implicitly injected `jest` broke when using fake timers across multiple specs

**Symptom**

Tests that passed individually failed in the full suite. The timers of one spec "contaminated" the next one.

**Root cause**

The specs that called `jest.useFakeTimers()` in `beforeEach` did not restore with `jest.useRealTimers()` in `afterEach`, or imported `jest` in inconsistent ways across files.

**Solution**

Centralize all fake timer management in a `JestTimers` helper:

```ts
// test/shared/jest-timers.ts
import { jest } from '@jest/globals';

const FIXED_DATE = new Date('2026-01-01T12:00:00Z');

export class JestTimers {
  static setup(date: Date = FIXED_DATE): void {
    jest.useFakeTimers().setSystemTime(date);
  }

  static teardown(): void {
    jest.useRealTimers();
  }
}
```

Usage in specs:

```ts
import { JestTimers } from '@test/shared/jest-timers';

beforeEach(() => JestTimers.setup());
afterEach(() => JestTimers.teardown());
```

Benefits:
- A single place where `jest` is imported from `@jest/globals`
- The fixed date `FIXED_DATE` lives in a single place
- The specs do not need to know anything about Jest's timer system

---

## Final configuration

```
jest + ts-jest + @jest/globals on the same major
NODE_OPTIONS=--experimental-vm-modules
tsconfig.test.json with module: ES2022 + moduleResolution: bundler
```

```
apps/api/
├── jest.config.ts           ← extensionsToTreatAsEsm, transformIgnorePatterns
├── tsconfig.test.json       ← module: ES2022, moduleResolution: bundler
└── test/shared/
    └── jest-timers.ts       ← helper for fake timers
```
