# ESLint + Prettier — Code conventions

> Applies to `apps/api` and `apps/client`. Any exception must be justified with an inline comment and a note in the corresponding ADR.

---

## Prettier

Shared configuration in the `.prettierrc` of each app:

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 80,
  "endOfLine": "lf"
}
```

| Option | Value | Reason |
|---|---|---|
| `singleQuote` | `true` | Consistency with the modern JS/TS ecosystem |
| `trailingComma` | `"all"` | Cleaner diffs when adding elements: only the new line changes |
| `printWidth` | `80` | Prettier and industry standard: any evaluator recognizes it |
| `endOfLine` | `"lf"` | Forces LF on all OSes: avoids CRLF bugs in git diffs on Windows |
| `semi` | `true` (default) | Explicit > implicit: avoids ASI edge cases |

---

## ESLint

Both apps use **ESLint Flat Config** with `typescript-eslint` in `recommendedTypeChecked` mode: this enables the type-aware rules that require the TypeScript service to work.

### Shared rules

#### TypeScript

| Rule | Level | Why |
|---|---|---|
| `@typescript-eslint/no-explicit-any` | `error` | `any` cancels TypeScript inference: if you need an escape, use `unknown` and narrowing |
| `@typescript-eslint/no-unused-vars` | `error` | Args with a `_` prefix are ignored (e.g. `_event`). Unused variables are visible debt |
| `@typescript-eslint/consistent-type-imports` | `error` | Forces `import type` for type-only imports. Improves tree-shaking and makes the runtime intent clear |
| `@typescript-eslint/prefer-nullish-coalescing` | `error` | Prefers `??` over `\|\|`. `0` and `""` are valid values: `\|\|` treats them as falsy |
| `@typescript-eslint/prefer-optional-chain` | `error` | Prefers `a?.b` over `a && a.b`: safer and more readable |

#### ESLint base

| Rule | Level | Why |
|---|---|---|
| `eqeqeq` | `error` | `===` always. `==` has type coercions that produce hard-to-find bugs |
| `no-console` | `warn` | Debug `console.log` must not reach production. Use a dedicated logger |

---

### App-specific rules

#### `apps/api`

| Rule | Level | Why |
|---|---|---|
| `@typescript-eslint/explicit-function-return-type` | `error` | Every function in the backend must have an explicit contract: use cases, repositories and services are contracts, not implicit implementations |
| `@typescript-eslint/no-floating-promises` | `error` | A promise without `await` or `.catch()` is a silent error waiting to reach production |
| `@typescript-eslint/no-unsafe-argument` | `error` | Arguments of type `any` passed to typed functions break the type safety chain |

#### `apps/client`

| Rule | Level | Why |
|---|---|---|
| `@typescript-eslint/explicit-function-return-type` | `warn` (`allowExpressions: true`) | In React components the type is inferred from the JSX. It warns but does not block: it is required in hooks and utility functions |

---

## How to run

```bash
# From apps/api/ or apps/client/
pnpm exec eslint src/ --max-warnings=0   # lint
pnpm exec prettier --check "src/**/*.ts" # check formatting
pnpm exec prettier --write "src/**/*.ts" # format
```

---

## What NOT to do

- **Do not disable rules with `// eslint-disable`** without a comment that justifies why
- **Do not use `any`**: if you need to type something unknown, use `unknown` with type guards
- **Do not ignore `no-console` warnings** in code that goes to production: use the logger port in the api
