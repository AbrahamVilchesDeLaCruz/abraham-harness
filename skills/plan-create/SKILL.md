---
name: plan-create
description: "Trigger: When a task needs a phased plan before implementation. Derives public contracts and writes a plan of vertical slices without unnecessary questions."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

Use this skill to plan a task before any code changes. Use `plan-phase-implement` to execute the resulting plan.

## Hard Rules

- Derive contracts and phases from the request and project evidence. Document reasonable assumptions; ask only when a consequential decision cannot be inferred and blocks progress.
- Do not change source code or tests.
- Every phase is a vertical slice that spans the layers it needs. Never plan one technical layer per phase.
- After every phase, the build and the tests required by the project's verification policy must pass, and the phase must make sense as its own commit. This does not require a full local suite for every phase.
- Phase 1 produces something the user can see, run or interact with.
- Write the plan in English, whatever language the conversation uses.
- Quote the user's exact strings and examples, and mark assumptions as assumptions.
- Reuse the coordinator's discovery handoff, interview answers and selected frontend direction when present; do not restart exploration or reopen settled choices.

## Decision Gates

| Situation | Action |
| --- | --- |
| The task is not specified | Ask for it |
| A product decision is open | Choose a reasonable reversible default; ask only if a consequential choice cannot be inferred |
| The user gives no contracts | Propose them from the task description |
| A contract type has no change | Leave it out of the plan |

## Execution Steps

1. Read the project `AGENTS.md`, the docs it references, and the code the task touches.
2. Choose the smallest useful set of vertical phases and derive public contracts using `references/plan-guidelines.md`.
3. Record assumptions and write the plan from `assets/plan.template.md` to `.agents/plans/{YYYY_MM_DD}-{name}/{name}-plan.md`.
4. Hand the plan to the coordinator. If the user requested implementation, continue within that scope without asking for a separate plan approval; respect explicit plan-only requests and stop points.

## Output Contract

Return the plan path, the phases with their contracts, the assumptions and the next step.

## References

- `references/plan-guidelines.md`: public contracts and vertical slices.
- `assets/plan.template.md`: plan structure.
