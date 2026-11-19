# Integration and candidate freeze

Use one integration branch and worktree per phase, based on the task contracts' common base.

Before assigning checks, read the project's root and scoped `AGENTS.md` and its verification policy in `docs/`. The project verification policy sets test scope and frequency when it differs from this shared default. Never turn a project rule that reserves full suites for CI into a local full-suite gate. A final feature candidate is the last integrated candidate for the whole requested feature, not the frozen candidate of every SDD phase.

1. Create a unique branch and worktree for each task. Confirm each starts at the declared base SHA before delegation.
2. Prepare each worktree once (dependency install, environment file, dedicated database and readable discovery/prototype snapshots when needed), preferably with a project script, before delegation. Verify that the assigned role can read those snapshots in its workspace. Builders do not repeat it.
3. Builders commit completed work locally on their assigned branches. They do not push, merge, or edit another task's worktree.
4. Collect each task's commit SHA, changed paths, command results and blockers. Reject a handoff with a wrong base, dirty worktree, unauthorized path or missing check evidence.
5. Integrate completed task commits into the integration branch in dependency order. Resolve conflicts there, never by changing the task contract silently. If a resolution changes task behavior or acceptance criteria, return it to the affected builder.
6. Run the phase's seam checks on the combined tree: tests for changed modules and their connections, cross-task contracts, phase acceptance criteria, project build/typecheck, and applicable lint/format checks. Do not replay every builder iteration and early check merely because it appears in a task contract. Deduplicate commands that cover the same scope.
7. Under the shared default, run the full unit suite locally once before freezing the final feature candidate; an independently published or high-risk phase, such as authentication, migrations or global wiring, also gets its required full gate. If the project reserves full suites for CI, use focused local checks even at those gates and follow its CI trigger instead. Routine E2E runs in CI, not in the local candidate gate. Require passing full unit and E2E CI before release/main merge or deployment; require an earlier phase CI gate only when the project policy or independently published phase requires it. If the required CI needs an unauthorized push or PR, freeze the candidate pending CI; never record CI as passed.
8. Write a phase check ledger with the exact command, tested scope, reason, observed result and elapsed time. Record the local unit-suite status and the CI unit/E2E status with its candidate SHA separately; state why a check was deferred or is pending. A failed or unavailable required check is not a pass. Compare ledgers across phases to find repeated work.
9. Freeze only when the phase's required checks pass and the integration worktree is clean. Record the integration candidate commit SHA and base SHA. Do not modify that candidate while reviews run.
10. After approval, report task branches/commits, integration candidate and check ledger. Integrate into the existing working branch within the requested scope only after any CI gate in step 7 passes. Follow `publication-authorization.md` for local integration and any authorized remote delivery.

If integration or review requires a change, create a new candidate SHA and repeat all checks invalidated by that change. Preserve task commits and conflict-resolution notes for traceability.

## Phase check ledger

Keep this table in the shared plan or FTD evidence. It is the handoff to reviewers and the basis for comparing runtime cost; do not paste full test logs into every role prompt.

| Phase/candidate | Command or CI run | Scope and reason | Result | Elapsed | Local units / CI E2E status |
|---|---|---|---|---|---|
| <phase and SHA> | <exact command or CI run URL and SHA> | <changed module, seam or final gate> | <observed result> | <wall time> | passed / deferred / pending / not applicable |

## Integrating into a parent branch

Treat a feature, fix or other task branch as a possible parent for phase worktrees. Do not assume a task worktree is a throwaway branch or that its commit may be integrated anywhere. The requested implementation authorizes integration into its existing working branch. Record source, target, method and task scope; use project policy or a non-destructive method. Confirm the target and preserve unrelated changes. Ask if the target is genuinely ambiguous or a different branch is requested without authorization.

## Publication and PRs

Remote writes are opt-in. A direct user instruction may authorize a bounded set of actions, such as pushing one named branch and opening one PR to one named base. Follow `publication-authorization.md` for preflight and postflight checks. Use the target repository's own PR template, labels, required checks and branch rules; do not import a global skill's repo-specific issue or line-budget requirements.

## Runtime without isolated workspaces

Parallel writers require genuinely separate writable workspaces. If the adapter cannot create or address separate worktrees, do not launch concurrent builders in the same checkout. Run tasks serially there, preserving the same contracts and checks. An external isolation mechanism is acceptable only when the coordinator can verify each workspace's branch, base and changed paths. Report the concurrency limitation to the user.
