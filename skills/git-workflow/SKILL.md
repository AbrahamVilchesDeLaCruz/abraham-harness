---
name: git-workflow
description: "Trigger: Cuando se crea una rama, se abre un PR, o se mergea código. Guía de branching, naming y merge strategy."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

- Al crear una nueva rama de trabajo
- Al abrir un PR (feat/* o fix/* → dev, o dev → main)
- Al mergear un PR — elegir la estrategia correcta
- Al nombrar una rama o escribir el título de un PR

## Hard Rules

Ramas permanentes:

```
main   ← producción — NUNCA push directo, NUNCA force push
dev    ← integración — NUNCA push directo
```

- El nombre describe QUÉ hace la rama, no cómo. Usar kebab-case, en inglés.
- Estrategia de merge — NUNCA mezclar: usar solo el método de la tabla de Decision Gates.
- **Rebase está deshabilitado** en el repo — no intentar usarlo.
- OBLIGATORIO: después de mergear cualquier PR efímero (`feat/*`, `fix/*`, `ci/*`, `chore/*`, etc.), eliminar la rama remota.
- El título del PR se convierte en el squash commit message — debe seguir conventional commits.

## Decision Gates

Estrategia de merge:

| PR | Método | Prohibido |
|---|---|---|
| `feat/*` o `fix/*` → `dev` | **Squash and merge** | Merge commit, Rebase |
| `dev` → `main` | **Merge commit** | Squash, Rebase |

Ramas efímeras — naming:

```
feat/nombre-descriptivo     ← nueva feature
fix/nombre-descriptivo      ← bugfix
refactor/nombre-descriptivo ← refactor sin cambio de comportamiento
chore/nombre-descriptivo    ← mantenimiento, deps, config
```

```bash
# ✅ Correcto
feat/discount-rules
fix/payment-provider-timeout
refactor/order-domain-model

# ❌ Incorrecto
feature-1
my-working-branch
fix
```

## Execution Steps

Flujo obligatorio:

```
1. git checkout dev && git pull
2. git checkout -b feat/nombre-descriptivo
3. trabajar + commits convencionales
4. PR: feat/* → dev        → Squash and merge + eliminar rama remota
5. PR: dev   → main        → Merge commit  (solo cuando dev está estable)
```

Comandos:

```bash
# Crear rama desde dev actualizado
git checkout dev && git pull && git checkout -b feat/nombre

# Ver ramas locales
git branch

# Subir rama y abrir PR con gh CLI
git push -u origin feat/nombre
gh pr create --base dev --title "feat(scope): descripción" --body ""

# PR de dev a main
gh pr create --base main --head dev --title "chore(release): vX.Y.Z"
```

Limpieza de ramas tras merge:

```bash
# gh lo hace automáticamente con --delete-branch
gh pr merge <número> --squash --delete-branch

# Si la rama remota sobrevivió, eliminarla manualmente
git push origin --delete nombre-rama

# Limpiar referencias locales obsoletas
git fetch --prune
```

## Output Contract

Commits convencionales:

```
feat(scope): descripción corta
fix(scope): descripción corta
refactor(scope): descripción corta
test(scope): descripción corta
chore(scope): descripción corta
docs(scope): descripción corta
perf(scope): descripción corta
```

Scopes válidos: nombres de bounded context o de área transversal del proyecto (por ejemplo `products`, `orders`, `auth`, `users`, `observability`, `ci`). Decláralos en `commitlint.config.ts`.

Títulos de PR:

```
# ✅ Correcto
feat(products): implement discount rules
fix(payments): handle provider timeout with retry logic

# ❌ Incorrecto
My changes
WIP
fix stuff
```

## References

- **Guía completa**: `docs/engineering/git-workflow.md`
- Lee [`references/docs.md`](references/docs.md) para skills relacionadas, ADRs y documentación externa.
