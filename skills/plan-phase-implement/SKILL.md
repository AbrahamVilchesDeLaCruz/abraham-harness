---
name: plan-phase-implement
description: "Trigger: When implementing a contracted task in a plan phase. Implements only the assigned task, records checks and commits on its isolated local branch."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## Activation Contract

Use this skill to implement one task contract from the current phase of a plan in `.agents/plans/`.

## Hard Rules

- Implement only the task contract you receive. Never start another task or phase without coordinator direction.
- Commit completed work locally on the assigned task branch. Never push or merge branches; the coordinator integrates task commits and the user controls final publication.
- Use the task ID selected by the coordinator; do not independently claim another unchecked task.
- Check an item only after you observe its result. Record a check that failed or could not run.
- Do not change contracts that the plan agreed on. Stop and ask when the plan turns out to be wrong.

## Decision Gates

| Situation | Action |
| --- | --- |
| No plan or task contract is specified | Ask for it |
| All tasks in the current phase are checked | Report completion; do not start the next phase |
| The assigned task is blocked | Stop and report the exact blocker |

## Execution Steps

1. Read the task contract and identify its phase, dependencies, allowed paths and checks.
2. Load the concept and stack skills that the project `AGENTS.md` names for each layer you touch.
3. Implement only the task's acceptance criteria with `tdd-workflow`.
4. Run every check in the task contract and fix any issue within its authorized paths.
5. Record observed results and report task completion and the next eligible task to the coordinator. The coordinator updates shared plan progress after integration.
6. Stage and commit the task changes on the assigned local branch. Record the commit SHA and ensure the working tree is clean.

## Output Contract

Return the plan and task IDs, branch, base and task commit SHAs, changed paths, each command with its observed result, and blockers or contract deviations. Then stop.
