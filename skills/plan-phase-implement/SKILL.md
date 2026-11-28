---
name: plan-phase-implement
description: "Trigger: When implementing a contracted task in a plan phase. Implements only the assigned task, records checks and commits on its isolated local branch."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## Activation Contract

Use this skill to implement one task contract from an FTD document or current plan phase in `.agents/plans/`.

## Hard Rules

- Implement only the task contract you receive. Never start another task or phase without coordinator direction.
- Commit completed work locally on the assigned task branch. Never push or merge branches; the coordinator integrates task commits and the user controls final publication.
- Use the task ID selected by the coordinator; do not independently claim another unchecked task.
- Check an item only after you observe its result. Record a check that failed or could not run.
- Pause the affected task and return a diagnosed conflict to the coordinator if the contract needs revision.

## Decision Gates

| Situation | Action |
| --- | --- |
| No FTD document or plan and task contract are specified | Ask for them |
| All tasks in the current phase are checked | Report completion; do not start the next phase |
| The assigned task is blocked | Report the exact blocker and resumable partial work to the coordinator |

## Execution Steps

1. Read the task contract and identify its phase, dependencies, allowed paths and checks. Compare checks with the project's verification policy; report a conflict to the coordinator instead of running a forbidden full local suite.
2. Load the concept and stack skills that the project `AGENTS.md` names for each layer you touch.
3. Implement only the task's acceptance criteria. Apply `tdd-workflow` to new observable behavior; apply the client visual and accessibility checks to presentation-only UI.
4. Run every policy-compliant check in the task contract and fix any issue within its authorized paths.
5. Record observed results and report task completion and the next eligible task to the coordinator. The coordinator updates shared plan progress after integration and before stopping or handing off: mark only verified items, record checks and blockers, and set the next step.
6. Stage and commit the task changes on the assigned local branch. Record the commit SHA and ensure the working tree is clean.

## Output Contract

Return the plan and task IDs, branch, base and task commit SHAs, changed paths, each command with its observed result, and blockers or contract deviations. Then stop.
