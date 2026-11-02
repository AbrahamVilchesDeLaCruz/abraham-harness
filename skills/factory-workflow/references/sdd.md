# SDD: the phase chain

Use it when several decisions affect each other. The artifact is the contract: code is checked against the plan, and the plan against the spec. When they disagree, fix the disagreement before writing more code.

| Phase | Owner | Result |
| --- | --- | --- |
| Specify | `spec-planner` | `{name}-spec.md`: what and why, with no how |
| Clarify | `spec-planner` and the user | Open questions answered and written into the spec |
| Plan | `spec-planner` with `plan-create` | `{name}-plan.md`, with contracts and phases the user approved |
| Analyze | `spec-planner` | A report of gaps between spec and plan, with no changes |
| Implement | `builder` with `plan-phase-implement` | One phase, staged |
| Verify | `builder` | Observed results of the verification command |
| Review | The gate in `gate.md` | The approver's verdict |
| Ship | The user | Commit, push and merge |

Implement, Verify and Review repeat for each phase, and the user commits between phases.

Artifacts live in `.agents/plans/{YYYY_MM_DD}-{name}/`.

Skip Clarify or Analyze only when the spec is unambiguous and tiny, and say so out loud.
