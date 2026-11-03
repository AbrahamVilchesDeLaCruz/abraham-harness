---
name: makefile
description: "Trigger: When creating or changing a project's Makefile, or adding a command to start the stack. Gives every project the same targets: make help, make local, make dev, make prod and the code commands."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

Use this skill when a project needs a Makefile, when you add a command to one, or when you run the stack.

## Hard Rules

- Every project has the same targets, with the same names and meanings. Do not rename them.
- `make` with no target prints the help, and every target has a `## description`.
- The root `Makefile` is only a dispatcher. Targets live in `make/*.mk`.
- A command only this project needs goes in `make/project.mk`. Never edit `make/local.mk`, `dev.mk`, `prod.mk` or `code.mk`: `update` refreshes them, and it keeps and reports a module that was edited by hand, so that module stops receiving updates.
- `update` never touches the root `Makefile` or `make/project.mk`.
- Every Docker target goes through `ensure-docker`, and through its environment's compose variable.
- A target that destroys data needs `CONFIRM=yes`.
- Secrets come from `SECRETS_LOCAL`, `SECRETS_DEV` and `SECRETS_PROD`. Never write a secret or a provider's command in a shared module.

## Decision Gates

| You want to | Run |
| --- | --- |
| See the commands | `make help`, or just `make` |
| Start everything locally | `make local` |
| Start the development stack | `make dev` |
| Start the production stack | `make prod` |
| Stop, read logs or see containers | `make {environment}-down`, `-logs` or `-status` |
| Delete local data and start again | `make local-reset CONFIRM=yes` |
| Create the env files | `make setup` |
| Change a shared module, in the `abraham-harness` repository | Edit it, then run `node scripts/stamp-make.mjs` |
| Test, lint, format or check types | `make test`, `test-e2e`, `lint`, `format` or `typecheck` |

## Execution Steps

1. Copy `assets/Makefile` and `assets/make/` to the project's root.
2. Replace `{{PROJECT_NAME}}` in the `Makefile`.
3. Create the compose files: `infra/docker-compose.local.yml`, `infra/docker-compose.dev.yml` and `infra/docker-compose.prod.yml`. Give each service a health check, because `up --wait` relies on it.
4. Set `PM` if the project does not use pnpm, and `APP_DIRS` if its apps live elsewhere. Add the scripts that `make/code.mk` calls to the root `package.json`.
5. Run `make` and `make local`, and confirm that the stack starts.

## Output Contract

Return the targets the project has, and the result of `make local`.

## References

- `assets/Makefile`: the dispatcher.
- `assets/make/`: `local.mk`, `dev.mk`, `prod.mk` and `code.mk`.
