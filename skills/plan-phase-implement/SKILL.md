---
name: plan-phase-implement
description: "Trigger: When implementing a phase of a plan from plan-create. Implements only one phase per invocation, stops for review, and never commits."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

Use this skill to implement the current phase of a plan in `.agents/plans/`.

## Hard Rules

- Implement only one phase per invocation. Never start the next phase without an explicit request from the user.
- Never commit, push or merge. The user decides when to commit.
- The current phase is the first phase with an unchecked `- [ ]` item.
- Check an item only after you observe its result. Record a check that failed or could not run.
- Do not change contracts that the plan agreed on. Stop and ask when the plan turns out to be wrong.

## Decision Gates

| Situation | Action |
| --- | --- |
| No plan is specified | Ask for it |
| All phases are checked | Say so, and do not implement anything again |
| The current phase is blocked | Stop and report the exact blocker |

## Execution Steps

1. Identify the current phase, and read the plan's context.
2. Load the concept and stack skills that the project `AGENTS.md` names for each layer you touch.
3. Implement the phase's to-do items with `tdd-workflow`.
4. Run the project's verification command, and fix any issue.
5. Check the completed items, and update the plan's `Next step` section.
6. In the plan's frontmatter, set `last_implementation_at` and `has_completed_all_phases`.
7. Stage the changes with `git add`, and get the candidate with `git write-tree`.

## Output Contract

Return the plan path, the phase, the `git write-tree` SHA, each command with its observed result, and 3 alternative commit messages that follow `git-workflow`. Then stop.
