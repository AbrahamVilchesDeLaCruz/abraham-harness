# oxlint + Prettier — Code conventions

> Applies to `apps/api` and `apps/client`. Any exception must be justified with an inline comment and a note in the corresponding ADR.

The official templates decide the tools: both bring oxlint. Keep them, and keep their config files. This document only adds the project's rules on top.

---

## Prettier

The NestJS template brings Prettier with its `.prettierrc`: keep it. The Vite template does not bring it, so add `prettier` as a dev dependency and use the same file:

```json
{
  "singleQuote": true,
  "trailingComma": "all"
}
```

| Option | Value | Reason |
|---|---|---|
| `singleQuote` | `true` | Consistency with the modern JS/TS ecosystem |
| `trailingComma` | `"all"` | Cleaner diffs when adding elements: only the new line changes |

---

## oxlint

Both apps run oxlint with **type-aware rules** (`--type-aware`), which need the `oxlint-tsgolint` package: the NestJS template brings it, and the client adds it and passes the flag in its `lint` script.

Add these rules to the `rules` block of each app's `.oxlintrc.json`. Keep what the template sets, unless a rule below sets it differently (the NestJS template turns `typescript/no-explicit-any` off, and the project turns it on).

### Shared rules

| Rule | Level | Why |
|---|---|---|
| `typescript/no-explicit-any` | `error` | `any` cancels TypeScript inference: if you need an escape, use `unknown` and narrowing |
| `typescript/no-unused-vars` | `error`, `{ "argsIgnorePattern": "^_" }` | Args with a `_` prefix are ignored (e.g. `_event`). Unused variables are visible debt |
| `typescript/prefer-nullish-coalescing` | `error` | Prefers `??` over `\|\|`. `0` and `""` are valid values: `\|\|` treats them as falsy |
| `typescript/prefer-optional-chain` | `error` | Prefers `a?.b` over `a && a.b`: safer and more readable |
| `typescript/no-floating-promises` | `error` | A promise without `await` or `.catch()` is a silent error waiting to reach production |
| `eqeqeq` | `error` | `===` always. `==` has type coercions that produce hard-to-find bugs |
| `no-console` | `error` | Debug `console.log` must not reach production. Use the logger port in the api |

### App-specific rules

#### `apps/api`

| Rule | Level | Why |
|---|---|---|
| `typescript/explicit-function-return-type` | `error` | Every function in the backend must have an explicit contract: use cases, repositories and services are contracts, not implicit implementations |
| `typescript/no-unsafe-argument` | `error` | Arguments of type `any` passed to typed functions break the type safety chain |
| `typescript/consistent-type-imports` | `error` only under `test/**` | Forces `import type` for type-only imports. See below for why `src/` is excluded |

In `src/`, this rule flags a class injected by its constructor type, and its fix rewrites the import to `import type`. That erases the class from the decorator metadata, and dependency injection fails at runtime. So it applies only to tests:

```json
"overrides": [
  {
    "files": ["test/**"],
    "rules": {
      "typescript/consistent-type-imports": "error",
      "typescript/unbound-method": "off"
    }
  }
]
```

`typescript/unbound-method` is off in tests because `expect(repository.save)` asserts on a mock method and calls nothing.

Interfaces in a decorated signature still need `import type` in `src/`: the template's `isolatedModules` makes `tsc` report them.

#### `apps/client`

| Rule | Level | Why |
|---|---|---|
| `typescript/consistent-type-imports` | `error` | Forces `import type` for type-only imports. Improves tree-shaking and makes the runtime intent clear |
| `typescript/explicit-function-return-type` | `warn`, `{ "allowExpressions": true }` | In React components the type is inferred from the JSX. It warns but does not block: it is required in hooks and utility functions |

---

## How to run

```bash
# From apps/api/ or apps/client/
pnpm lint                                # lint, with the template's script
pnpm exec oxlint --type-aware --fix src/ # lint and fix
pnpm exec prettier --check "src/**/*.ts" # check formatting
pnpm exec prettier --write "src/**/*.ts" # format
```

Pre-commit runs `lint-staged`, which runs oxlint and Prettier on the staged files only.

---

## What NOT to do

- **Do not replace the template's linter or formatter** from a guide
- **Do not disable rules with `// oxlint-disable`** without a comment that justifies why
- **Do not use `any`**: if you need to type something unknown, use `unknown` with type guards
- **Do not silence `no-console`** in code that goes to production: use the logger port in the api
