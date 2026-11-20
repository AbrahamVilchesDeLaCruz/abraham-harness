# SDD: the phase chain

Use it when several decisions affect each other, or when the work is too large to resume from the request and `git diff` alone. The artifact is the contract: code is checked against the plan, and the plan against the spec. When they disagree, fix the disagreement before writing more code.

| Phase | Owner | Result |
| --- | --- | --- |
| Explore | Coordinator | Source-linked discovery handoff proportional to task uncertainty and risk |
| Interview | Coordinator | Optional user answers in batches of up to ten A/B/C questions; assumptions when declined |
| Domain model choice | Coordinator and optional `architect` | Reviewed navigable HTML of aggregates, Value Objects and ubiquitous language, or recorded creative freedom |
| Prototype choice | Coordinator | For material frontend design, reviewed navigable HTML or recorded creative freedom |
| Specify | `spec-writer` | `{name}-spec.md`: what and why, with no how |
| Clarify | `spec-writer` | Assumptions recorded; ask the user only about consequential blockers |
| Plan | `spec-writer` with `plan-create` | `{name}-plan.md`, with contracts and phases derived from the request |
| Analyze | `spec-writer` | A report of gaps between spec and plan, with no changes |
| Decompose | Coordinator | Independent task contracts, dependencies and authorized paths |
| Implement | One or more `builder` roles | A local commit on a dedicated task branch and worktree |
| Integrate | Coordinator | Phase candidate and check ledger; focused local checks unless the project policy requires a wider gate, with complete CI at its publication gate |
| Review | The gate in `gate.md` | Relevant reviewer verdicts and approver synthesis |
| Deliver | Coordinator | Integrate into the existing working branch; publish only when authorized |

Implement tasks in parallel only when they share a base and have no unresolved dependency or path overlap. Each phase freezes a phase candidate; only the last integrated candidate of the whole feature is the final feature candidate. Integration, seam checks and Review run once all tasks in the phase are complete. A rejected review returns only the affected tasks to Implement; any resulting integration change requires a new candidate and fresh applicable reviews. Continue within the requested scope unless the user or approved plan specifies a phase stop. Update plan progress before stopping or handing off.

Artifacts live in `.agents/plans/{YYYY_MM_DD}-{name}/`.

Run the pre-spec rows through `discovery.md`; follow `domain-model.md` and `prototype.md` only when the user chooses the corresponding review. Give the spec writer the single discovery handoff. Do not reopen settled choices or repeat exploration without new evidence.

Skip Clarify or Analyze only when the spec is unambiguous and tiny, and say so out loud.

Use `task-contract.md` for decomposition and `integration.md` for branch, worktree and candidate handling. If the runtime cannot provide isolated workspaces, execute tasks serially in the current workspace; do not run concurrent writers there.
