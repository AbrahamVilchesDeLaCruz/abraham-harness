# Integration and candidate freeze

Use one integration branch and worktree per phase, based on the task contracts' common base.

1. Create a unique branch and worktree for each task. Confirm each starts at the declared base SHA before delegation.
2. Prepare each worktree once (dependency install, environment file, dedicated database and readable discovery/prototype snapshots when needed), preferably with a project script, before delegation. Verify that the assigned role can read those snapshots in its workspace. Builders do not repeat it.
3. Builders commit completed work locally on their assigned branches. They do not push, merge, or edit another task's worktree.
4. Collect each task's commit SHA, changed paths, command results and blockers. Reject a handoff with a wrong base, dirty worktree, unauthorized path or missing check evidence.
5. Integrate completed task commits into the integration branch in dependency order. Resolve conflicts there, never by changing the task contract silently. If a resolution changes task behavior or acceptance criteria, return it to the affected builder.
6. Run the phase's seam checks on the combined tree: tests for changed modules and their connections, cross-task contracts, phase acceptance criteria, project build/typecheck, and applicable lint/format checks. Do not replay every builder iteration and early check merely because it appears in a task contract. Deduplicate commands that cover the same scope.
7. Run the full unit and slow E2E suites once before freezing the final feature candidate. Run them in an independently published phase or a high-risk phase too, including authentication, migrations or global wiring. An intermediate phase without those triggers records the full suite as deferred to the final candidate, not as passed. Deduplicate by scope: if the E2E orchestrator already runs all unit suites, do not rerun them; otherwise run each missing unit scope once.
8. Write a phase check ledger with the exact command, tested scope, reason, observed result and elapsed time; note whether the full suite ran or was deferred, and why. A failed or unavailable required check is not a pass. Compare ledgers across phases to find repeated work.
9. Freeze only when the phase's required checks pass and the integration worktree is clean. Record the integration candidate commit SHA and base SHA. Do not modify that candidate while reviews run.
10. After approval, report task branches/commits, integration candidate and check ledger. Integrate into the existing working branch within the requested scope. Follow `publication-authorization.md` for local integration and any authorized remote delivery.

If integration or review requires a change, create a new candidate SHA and repeat all checks invalidated by that change. Preserve task commits and conflict-resolution notes for traceability.

## Phase check ledger

Keep this table in the shared plan or FTD evidence. It is the handoff to reviewers and the basis for comparing runtime cost; do not paste full test logs into every role prompt.

| Phase/candidate | Command | Scope and reason | Result | Elapsed | Full suite status |
|---|---|---|---|---|---|
| <phase and SHA> | <exact command> | <changed module, seam or final gate> | <observed result> | <wall time> | ran / deferred to final / not applicable |

## Integrating into a parent branch

Treat a feature, fix or other task branch as a possible parent for phase worktrees. Do not assume a task worktree is a throwaway branch or that its commit may be integrated anywhere. The requested implementation authorizes integration into its existing working branch. Record source, target, method and task scope; use project policy or a non-destructive method. Confirm the target and preserve unrelated changes. Ask if the target is genuinely ambiguous or a different branch is requested without authorization.

## Publication and PRs

Remote writes are opt-in. A direct user instruction may authorize a bounded set of actions, such as pushing one named branch and opening one PR to one named base. Follow `publication-authorization.md` for preflight and postflight checks. Use the target repository's own PR template, labels, required checks and branch rules; do not import a global skill's repo-specific issue or line-budget requirements.

## Runtime without isolated workspaces

Parallel writers require genuinely separate writable workspaces. If the adapter cannot create or address separate worktrees, do not launch concurrent builders in the same checkout. Run tasks serially there, preserving the same contracts and checks. An external isolation mechanism is acceptable only when the coordinator can verify each workspace's branch, base and changed paths. Report the concurrency limitation to the user.
