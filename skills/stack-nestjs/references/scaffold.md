# Scaffold NestJS API with Express adapter

## Context

Monorepo `myapp`. The API lives in `apps/api/`.
Git is already initialized at the monorepo root — do NOT run `git init`.
Package manager: pnpm.

## The rule

Run the official CLI and keep what it generates: its test runner, linter, formatter, TypeScript version and module system. Never replace them from a guide. Then apply only the project's architecture on top.

Read the generated `package.json` and config files to see what the template brings today, instead of assuming it from this document.

## Commands

```bash
cd apps
pnpm dlx @nestjs/cli@latest new api --package-manager pnpm --skip-git
cd api
# Remove demo files
rm src/app.controller.ts src/app.controller.spec.ts src/app.service.ts test/app.e2e-spec.ts
```

## On top of the template

- Express adapter (default — do NOT use Fastify)
- `package.json` name: `@myapp/api`
- Path aliases in `tsconfig.json`: `"paths": { "@/*": ["./src/*"], "@test/*": ["./test/*"] }`. The template's Vitest configuration and `nest build` resolve them
- Project lint rules: `linting.md` in `engineering-conventions`
- No sample/demo content — keep only `app.module.ts` and `main.ts` as empty shells. Remove the demo controller and service from `AppModule`, and give `bootstrap` its return type (`Promise<void>`)
- Port read from the environment variable `PORT`, not hardcoded (the template already does this)

## Module system

The template is ESM (`"type": "module"`, `"module": "nodenext"`). Imports of project files end in `.js`, also through the aliases: `import { ProductCreator } from '@/catalog/product/application/create/product-creator.js'`. Without the extension, `nest build` fails.

## Expected structure after scaffold

```
apps/api/
├── src/
│   ├── app.module.ts    ← root module, empty (no controllers or providers)
│   └── main.ts          ← bootstrap, listens on port from env (default 3000)
├── test/
├── package.json         ← name: @myapp/api
├── tsconfig.json        ← strict: true (from the template), paths configured
├── tsconfig.build.json
├── nest-cli.json
└── the template's test, lint and format config files
```

## TypeScript

Use the newest TypeScript that the app's CLI accepts. Do not fix a version in a skill.

## TypeScript 7 and `nest build`

Run `nest build`. If it reports that the installed TypeScript does not expose the programmatic compiler API, the CLI does not support that version yet.

Keep the TypeScript major that the Nest template installed as `typescript`, because the Nest CLI loads it.

To gain the fast compiler now, add the newer version through an npm alias, and use it for a `typecheck` script:

```bash
npm i -D ts7@npm:typescript@7   # or: pnpm add -D ts7@npm:typescript@7
```

```json
"typecheck": "node node_modules/ts7/bin/tsc --noEmit -p tsconfig.json"
```

After this, `node_modules/.bin/tsc` may point to the alias, so call the binary by path. `nest build` keeps using the `typescript` package.

Remove the alias when `nest build` accepts the newer version: check this on each framework upgrade.

## Notes

- Do NOT install TypeORM, class-validator or any domain packages at this stage — they come later
- Do NOT commit — scaffolding will be reviewed before committing
