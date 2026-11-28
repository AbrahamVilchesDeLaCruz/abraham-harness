# SDD: the phase chain

Use it when several decisions affect each other, or when the work is too large to resume from the request and `git diff` alone. The artifact is the contract: code is checked against the plan, and the plan against the spec. When they disagree, fix the disagreement before writing more code.

| Phase | Owner | Result |
| --- | --- | --- |
| Explore | Coordinator | Source-linked discovery handoff proportional to task uncertainty and risk |
| Interview | Coordinator | One conversation for relevant open product decisions; proceed when they are settled |
| Domain model choice | Coordinator; `architect` only after yes | Brief notice of domain changes and a yes/no diagram choice; HTML only when requested |
| Prototype choice | Coordinator | For material frontend design, reviewed navigable HTML or recorded creative freedom |
| Specify | `spec-writer` | `{name}-spec.md`: what and why, with no how |
| Clarify | `spec-writer` | Assumptions recorded; ask the user only about consequential blockers |
| Plan | `spec-writer` with `plan-create` | `{name}-plan.md`, with contracts and phases derived from the request |
| Analyze | `spec-writer` | A report of gaps between spec and plan, with no changes |
| Decompose | Coordinator | Independent task contracts, dependencies and authorized paths |
| Implement | One or more `builder` roles | Verified local work; isolated task branches for parallel builders |
| Integrate | Coordinator | Phase candidate and check ledger; focused local checks unless the project policy requires a wider gate, with complete CI at its publication gate |
| Review | The gate in `gate.md` | High-risk increments and final accumulated diff, with validated reviewer verdicts |
| Deliver | Coordinator | Integrate into the existing working branch; publish only when authorized |

Schedule ready independent tasks in groups with a common base. Integrate each group before dispatching tasks that depend on its output. Verify seams at each phase and review high-risk phases early. Review the accumulated feature diff at the final candidate even when intermediate phases passed. The coordinator resolves technical plan gaps and returns defects to affected tasks; consult the owner if the business outcome, scope or authorization must change. Update the Markdown progress before stopping or handing off.

Artifacts live in `.agents/plans/{YYYY_MM_DD}-{name}/`.

Run the pre-spec rows through `discovery.md`; follow `domain-model.md` and `prototype.md` only when the user chooses the corresponding review. Give the spec writer the single discovery handoff. Do not reopen settled choices or repeat exploration without new evidence.

Skip Clarify or Analyze only when the spec is unambiguous and tiny, and say so out loud.

Use `task-contract.md` for decomposition and `integration.md` for branch, worktree and candidate handling. If the runtime cannot provide isolated workspaces, execute tasks serially in the current workspace; do not run concurrent writers there.
