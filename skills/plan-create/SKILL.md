---
name: plan-create
description: "Trigger: When a task needs a phased plan before implementation. Agrees on public contracts and the number of phases with the user, then writes a plan of vertical slices."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

Use this skill to plan a task before any code changes. Use `plan-phase-implement` to execute the resulting plan.

## Hard Rules

- Do not create the plan file until the user agrees on the public contracts and the phases.
- Do not change source code or tests.
- Every phase is a vertical slice that spans the layers it needs. Never plan one technical layer per phase.
- After every phase, the build and the tests must pass, and the phase must make sense as its own commit.
- Phase 1 produces something the user can see, run or interact with.
- Write the plan in English, whatever language the conversation uses.
- Quote the user's exact strings and examples, and mark assumptions as assumptions.

## Decision Gates

| Situation | Action |
| --- | --- |
| The task is not specified | Ask for it |
| A product decision is open | Ask one question and wait |
| The user gives no contracts | Propose them from the task description |
| A contract type has no change | Leave it out of the plan |

## Execution Steps

1. Read the project `AGENTS.md`, the docs it references, and the code the task touches.
2. Propose the phases and let the user choose the amount: minimum (1), intermediate (1 to 3) or very granular (more than 3).
3. Propose the public contracts of each phase, following `references/plan-guidelines.md`.
4. Wait for the user to approve the contracts and the phases.
5. Write the plan from `assets/plan.template.md` to `.agents/plans/{YYYY_MM_DD}-{name}/{name}-plan.md`.
6. Ask whether to stop, commit the plan with a `docs` commit, or implement Phase 1 only. Never implement more than one phase.

## Output Contract

Return the plan path, the phases with their contracts, the assumptions and the next step.

## References

- `references/plan-guidelines.md`: public contracts and vertical slices.
- `assets/plan.template.md`: plan structure.
