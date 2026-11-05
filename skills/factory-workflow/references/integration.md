# Integration and candidate freeze

Use one integration branch and worktree per phase, based on the task contracts' common base.

1. Create a unique branch and worktree for each task. Confirm each starts at the declared base SHA before delegation.
2. Builders commit completed work locally on their assigned branches. They do not push, merge, or edit another task's worktree.
3. Collect each task's commit SHA, changed paths, command results and blockers. Reject a handoff with a wrong base, dirty worktree, unauthorized path or missing check evidence.
4. Integrate completed task commits into the integration branch in dependency order. Resolve conflicts there, never by changing the task contract silently. If a resolution changes task behavior or acceptance criteria, return it to the affected builder.
5. Run the phase's seam checks: all task checks on the combined tree, project build/typecheck and relevant suite, plus cross-task contracts and phase acceptance criteria. Record commands and observed results. A skipped or unavailable check is not a pass.
6. Freeze only when integration and seam checks pass and the integration worktree is clean. Record the integration candidate commit SHA and base SHA. Do not modify that candidate while reviews run.
7. After approval, report task branches/commits, integration candidate and checks. The user controls final publication or merge into the destination branch.

If integration or review requires a change, create a new candidate SHA and repeat all checks invalidated by that change. Preserve task commits and conflict-resolution notes for traceability.

## Runtime without isolated workspaces

Parallel writers require genuinely separate writable workspaces. If the adapter cannot create or address separate worktrees, do not launch concurrent builders in the same checkout. Run tasks serially there, preserving the same contracts and checks. An external isolation mechanism is acceptable only when the coordinator can verify each workspace's branch, base and changed paths. Report the concurrency limitation to the user.
