---
name: factory-workflow
description: "Trigger: On every request in a project that uses this harness. Picks one lane (Answer, FTD or SDD), runs the role agents, and gates code changes on four reviewers and the approver."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.3"
---

## Activation Contract

Use this skill to route every request and to coordinate the role agents.

## Hard Rules

- Every turn takes exactly one lane. Name it in one line, in the user's language.
- Answer is read-only: write nothing and create no artifact. When intent is unclear, ask one question and stay in Answer.
- SDD applies when several open decisions affect each other, or when the work is large. Work is large when it could not be resumed from the request and `git diff` alone. Counts of files or lines never decide it.
- Promote FTD to SDD by using its document as input. Never restart or discard completed work.
- Every role reads the project's `docs/`, its Brain, before it acts. Shared conventions live in the skills. Use Engram too when it is available, and save every objection there. Read the project with CodeGraph when it is available, before shell commands.
- When the user corrects a project convention, record it with `doc-create`.
- Check a task off only with observed proof. Record a check that failed, was skipped or could not run.
- Every code change passes the gate in `references/gate.md`. Only changes limited to documentation or configuration skip it.
- Stop after each phase, and wait for the user. There is no autopilot.
- Only the user commits, pushes and merges, even after approval.

## Decision Gates

| The request | Lane |
| --- | --- |
| Asks to explain, compare, investigate, audit, review or propose | Answer |
| Authorizes a change that could be resumed from the request and `git diff`, with no interacting open decisions | FTD (the default for change) |
| Authorizes a change with several decisions that affect each other, or large work | SDD |
| Asks for a specific lane | That lane |

## Execution Steps

- **Answer:** Answer from evidence, and change nothing.
- **FTD:** Follow `references/ftd.md`: one feature document, then `builder`, then the gate.
- **SDD:** Follow `references/sdd.md`: `spec-writer`, then one `builder` phase at a time, each with the gate.

## Output Contract

Report the lane, the final approver block, each check with its observed result, and suggested commit messages.

## References

- `references/ftd.md`: the default lane for change.
- `references/sdd.md`: the phase chain for interacting decisions or large work.
- `references/gate.md`: reviewers and approval.
