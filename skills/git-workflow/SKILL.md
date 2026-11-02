---
name: git-workflow
description: "Trigger: When creating a branch, opening a PR, or merging code. Guide to branching, naming and merge strategy."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

- When creating a new working branch
- When opening a PR (feat/* or fix/* → dev, or dev → main)
- When merging a PR: choose the correct strategy
- When naming a branch or writing a PR title

## Hard Rules

Permanent branches:

```
main   ← production — NEVER push directly, NEVER force push
dev    ← integration — NEVER push directly
```

- The name describes WHAT the branch does, not how. Use kebab-case, in English.
- Merge strategy — NEVER mix: use only the method from the Decision Gates table.
- **Rebase is disabled** in the repo: do not try to use it.
- MANDATORY: after merging any ephemeral PR (`feat/*`, `fix/*`, `ci/*`, `chore/*`, etc.), delete the remote branch.
- The PR title becomes the squash commit message: it must follow conventional commits.

## Decision Gates

Merge strategy:

| PR | Method | Forbidden |
|---|---|---|
| `feat/*` or `fix/*` → `dev` | **Squash and merge** | Merge commit, Rebase |
| `dev` → `main` | **Merge commit** | Squash, Rebase |

Ephemeral branches — naming:

```
feat/descriptive-name     ← new feature
fix/descriptive-name      ← bugfix
refactor/descriptive-name ← refactor with no behavior change
chore/descriptive-name    ← maintenance, deps, config
```

```bash
# ✅ Correct
feat/discount-rules
fix/payment-provider-timeout
refactor/order-domain-model

# ❌ Incorrect
feature-1
my-working-branch
fix
```

## Execution Steps

Mandatory flow:

```
1. git checkout dev && git pull
2. git checkout -b feat/descriptive-name
3. work + conventional commits
4. PR: feat/* → dev        → Squash and merge + delete remote branch
5. PR: dev   → main        → Merge commit  (only when dev is stable)
```

Commands:

```bash
# Create a branch from an up-to-date dev
git checkout dev && git pull && git checkout -b feat/name

# List local branches
git branch

# Push the branch and open a PR with the gh CLI
git push -u origin feat/name
gh pr create --base dev --title "feat(scope): description" --body ""

# PR from dev to main
gh pr create --base main --head dev --title "chore(release): vX.Y.Z"
```

Branch cleanup after a merge:

```bash
# gh does it automatically with --delete-branch
gh pr merge <number> --squash --delete-branch

# If the remote branch survived, delete it manually
git push origin --delete branch-name

# Clean up stale local references
git fetch --prune
```

## Output Contract

Conventional commits:

```
feat(scope): short description
fix(scope): short description
refactor(scope): short description
test(scope): short description
chore(scope): short description
docs(scope): short description
perf(scope): short description
```

Valid scopes: names of a bounded context or of a cross-cutting area of the project (for example `products`, `orders`, `auth`, `users`, `observability`, `ci`). Declare them in `commitlint.config.ts`.

PR titles:

```
# ✅ Correct
feat(products): implement discount rules
fix(payments): handle provider timeout with retry logic

# ❌ Incorrect
My changes
WIP
fix stuff
```

## References

- **Complete guide**: `docs/engineering/git-workflow.md`
- Read [`references/docs.md`](references/docs.md) for related skills, ADRs and external documentation.
