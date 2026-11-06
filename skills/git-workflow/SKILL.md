---
name: git-workflow
description: "Trigger: When creating branches, integrating worktrees, opening PRs or merging code. Applies target-project Git policy and requires scoped authorization for mutations."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## Activation Contract

Use this skill when naming branches, integrating task/worktree branches, preparing PRs or choosing a merge strategy.

## Hard Rules

- The target project's `AGENTS.md`, branch protection, CI and PR template define the applicable policy. Treat examples in shared skills as defaults, not remote policy.
- Do not push, open a PR, integrate into a parent branch or merge without explicit user authorization for the target, refs and operation. Authorization for one operation does not authorize another.
- A task/worktree branch may target a feature/fix parent only when the user or approved plan names that parent and the integration method.
- Apply issue, label, line-budget and required-check rules only when the target project or current user requires them.
- Use Conventional Commits for commit messages and PR titles when they become squash commits.
- Never force-push or bypass target branch protection.

## Decision Gates

| Change | Default route |
|---|---|
| Independent task worktree | Integrate into the named phase/feature parent only when authorized |
| `feat/*` or `fix/*` to the target integration branch | Use the target repository's merge policy |
| Child `refactor/*` PR to a feature/fix branch | Use the chain method authorized for that parent; do not infer final-release policy |
| Release/integration branch to production | Follow the target repository's protected release policy |

## Execution Steps

1. Read target-project rules and `references/authorization.md`.
2. Inspect status, current branch, candidate SHA, remote and destination before each authorized mutation.
3. Keep worktree commits, local parent integration, push, PR creation and PR merge as distinct operations.
4. Verify the resulting refs/PR and report observed checks. Stop when authorization ends or a stated condition fails.

## Output Contract

Return source and target refs, chosen strategy, authorization scope, checks and resulting commit/PR identifiers. If an operation is not authorized, provide the exact handoff without performing it.

## References

- `references/authorization.md` — target precedence and scoped authorization checklist.
- `references/docs.md` — commit conventions and related guidance.
- `git-workflow.md` in `engineering-conventions` — example branching and protection policy; use only where the target adopts it.
