---
name: factory-workflow
description: "Trigger: When building a feature or behavior change with the role agents. Coordinates spec-planner, builder, the four reviewers and the approver."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

Use this skill to deliver a feature or behavior change with the role agents. Do not use it for questions or for changes that only touch documentation.

## Hard Rules

- Only the `approver` declares a candidate good. It needs a positive verdict from `security`, `ux`, `ui` and `code-reviewer` on the same commit.
- Any new commit invalidates all earlier verdicts, so the four reviewers run again.
- Keep the base commit of the first `builder` run through every round. Each review covers the whole change since that base, never only the latest correction.
- Reviewers and the approver do not edit files. Only the `builder` changes code.
- Stop after 3 rejected rounds and return the open blockers to the user.
- Merging and pushing stay with the user, even when the approver approves.

## Execution Steps

1. Delegate to `spec-planner`. Show the user the spec and any open question, and wait for approval.
2. For each task in the spec, delegate to `builder` with the spec path and the task. Keep the commit SHA and the base commit it returns.
3. Delegate to `security`, `ux`, `ui` and `code-reviewer` in parallel. Give each one the same commit SHA, the base commit and the spec path.
4. Delegate to `approver` with the four verdict blocks, unchanged.
5. On `APPROVER: REJECTED`, send `BLOCKERS` to `builder`, and repeat from step 3 with the new commit and the same base.

## Output Contract

Report the final approver block, the number of rounds, and the commit that is ready for the user to deliver.
