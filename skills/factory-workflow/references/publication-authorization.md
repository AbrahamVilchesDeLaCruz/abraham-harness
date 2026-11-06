# Publication and integration authorization

Use this contract whenever a worktree is integrated into a parent branch or a remote is changed. It allows a user to delegate an exact operation without granting blanket GitHub or Git authority.

## Authorization scope

A direct user instruction authorizes only the operations it names. Record:

| Field | Required evidence |
|---|---|
| Repository and remote | Exact repository; confirm the configured remote matches before pushing |
| Source | Branch/worktree and expected candidate commit SHA |
| Destination | Parent branch for local integration, or PR base branch for remote delivery |
| Operations | Explicit list: local integration, push, create PR, approve/review, merge, delete branch |
| Strategy | Merge, squash or other method when integration/merge is authorized |
| Conditions | Required review, CI, branch status and any user-specified stop point |
| PR metadata | Title and labels when creating a PR; use the target repository's template if it has one |

An instruction may authorize conditional future actions in one scope, for example: “After the named PR is approved and required checks pass, squash-merge it into the named parent branch and delete the source branch.” Do not infer that authority from permission to push or open the PR.

## Preflight

Before each authorized operation:

1. Read `git status --short --branch`, current branch and `git rev-parse HEAD`. Preserve unrelated or uncommitted user changes; never use `git reset`, `git add .`, stash/pop or force-push to clear them.
2. Confirm the named source ref still resolves to the reviewed candidate SHA. A changed SHA requires fresh relevant checks/review.
3. Confirm the remote, destination branch, existing PR state and method match the authorization. Use the target repository's current policy for required issues, labels, approvals, size limits and CI.
4. If a required field or policy is unclear, stop before the remote mutation and ask one focused question.

## Execution boundaries

- Integrate a task worktree into a feature/fix parent only when that exact target branch and method are authorized. Keep the task commit and resulting parent SHA in the report.
- Push only the authorized source branch to the authorized remote. Never infer permission to push a parent or protected branch.
- Create only the authorized PR with the authorized head/base, title and labels. Do not invent an issue link or size exception; apply such requirements only when the target repository actually requires them or the user requests them.
- Merge only when the specific merge operation is authorized, directly or through an explicit condition, and all stated review/CI gates pass. Never treat the approver's candidate verdict as implicit merge permission.
- Afterward, verify the resulting refs/PR state and report the exact observed result. If an operation fails, stop without trying a broader or destructive workaround.
