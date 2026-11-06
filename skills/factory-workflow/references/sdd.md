# SDD: the phase chain

Use it when several decisions affect each other, or when the work is too large to resume from the request and `git diff` alone. The artifact is the contract: code is checked against the plan, and the plan against the spec. When they disagree, fix the disagreement before writing more code.

| Phase | Owner | Result |
| --- | --- | --- |
| Specify | `spec-writer` | `{name}-spec.md`: what and why, with no how |
| Clarify | `spec-writer` and the user | Open questions answered and written into the spec |
| Plan | `spec-writer` with `plan-create` | `{name}-plan.md`, with contracts and phases the user approved |
| Analyze | `spec-writer` | A report of gaps between spec and plan, with no changes |
| Decompose | Coordinator | Independent task contracts, dependencies and authorized paths |
| Implement | One or more `builder` roles | A local commit on a dedicated task branch and worktree |
| Integrate | Coordinator | Integrated candidate, conflict resolutions and seam-check evidence |
| Review | The gate in `gate.md` | Relevant reviewer verdicts and approver synthesis |
| Deliver | The user, or coordinator when explicitly authorized | Integrate/publish only the named candidate and operations |

Implement tasks in parallel only when they share a base and have no unresolved dependency or path overlap. Integration, seam checks and Review run once all tasks in the phase are complete. A rejected review returns only the affected tasks to Implement; any resulting integration change requires a new candidate and fresh applicable reviews. Stop after each phase unless its exact next integration/delivery actions were authorized in advance.

Artifacts live in `.agents/plans/{YYYY_MM_DD}-{name}/`.

Skip Clarify or Analyze only when the spec is unambiguous and tiny, and say so out loud.

Use `task-contract.md` for decomposition and `integration.md` for branch, worktree and candidate handling. If the runtime cannot provide isolated workspaces, execute tasks serially in the current workspace; do not run concurrent writers there.
