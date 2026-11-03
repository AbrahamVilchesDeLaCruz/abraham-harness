# Scaffold React + TypeScript client app with Vite

## Context

Monorepo `myapp`. The client app lives in `apps/client/`.
Git is already initialized at the monorepo root — do NOT run `git init`.
Package manager: pnpm.

## The rule

Run the official CLI and keep what it generates: its linter, TypeScript version and module system, including TypeScript 7 if the template brings it. Never replace them from a guide. Then apply only the project's architecture on top.

Read the generated `package.json` and config files to see what the template brings today, instead of assuming it from this document.

## Commands

```bash
cd apps
pnpm create vite@latest client --template react-ts
cd client
pnpm install
pnpm add -D tailwindcss @tailwindcss/vite
```

## On top of the template

These add what the template does not bring. They replace nothing:

- TailwindCSS
- `"strict": true` in `tsconfig.app.json`
- Path aliases: `@/` → `src/`, in `tsconfig.app.json` and `vite.config.ts`
- Project lint rules and Prettier: `linting.md` in `engineering-conventions`
- No sample/demo content — delete everything inside `src/` except `main.tsx` and `App.tsx` (both empty shells)
- `package.json` name: `@myapp/client`

Vitest, Testing Library and Playwright come later, with `stack-vitest`.

## Expected structure after scaffold

```
apps/client/
├── public/
├── src/
│   ├── App.tsx          ← empty shell
│   └── main.tsx         ← mounts App into #root
├── index.html
├── package.json         ← name: @myapp/client
├── tsconfig.json
├── tsconfig.app.json    ← strict: true, paths configured
├── vite.config.ts       ← path alias @/ → src/
└── the template's lint config file
```

## Notes

- Do NOT install React Router, TanStack Query or Zustand at this stage — they come later
- Do NOT commit — scaffolding will be reviewed before committing
