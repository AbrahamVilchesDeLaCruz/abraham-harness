# Git operation authorization

## Precedence

Apply system/developer constraints first, then the current user's direct instructions and the target repository's actual `AGENTS.md`, branch protection, CI and PR template. Shared or personal/global skills are defaults; they cannot impose another repository's issue, label, size or publication policy.

## Scope a delegated operation

A user may authorize a bounded operation set. Record the exact:

- repository and remote;
- source worktree/branch and expected SHA;
- destination parent/base branch;
- operations permitted (local integration, push, PR creation, merge, branch deletion);
- merge strategy and conditions (review, CI, approval);
- PR title and labels when relevant.

Exact user-provided commands or an equivalent natural-language instruction are authorization for the named operation and arguments. Do not ask again for an already authorized action. Do not infer authority for an operation the user did not name. A conditional instruction may authorize a later merge, for example: “squash-merge this PR to the named parent after approval and required checks pass.”

## Preflight and safe handling

1. Check `git status --short --branch`, current branch and `git rev-parse HEAD`. Preserve unrelated or uncommitted changes; never use `git reset`, `git add .`, stash/pop or force-push to clear them.
2. Confirm the source SHA equals the reviewed candidate. If it changed, rerun affected checks/reviews.
3. Confirm the remote, base/head, merge method, existing PR state and required checks against the target project.
4. Do not invent a linked issue, size exception or label. Use one only if target policy or current user requires it.
5. After an authorized action, verify and report the exact branch/PR result. If it fails, stop; do not widen the target or use a destructive workaround.

## Worktree and child-PR integration

Task worktrees start from their declared base. The coordinator integrates their commits into the parent feature/fix branch only when that parent and method are named in the authorization. A child PR such as `refactor/*` → `feat/*` is a separate edge from the eventual `feat/*` → integration-branch PR. Its title/label and squash/merge method come from the user's plan and target policy; do not require an unrelated issue or size exception by default.
