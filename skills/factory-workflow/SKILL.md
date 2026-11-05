---
name: factory-workflow
description: "Trigger: On every request in a project that uses this harness. Routes work, coordinates isolated tasks and gates candidates with relevant reviews."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "3.0"
---

## Activation Contract

Use this skill to route every request and to coordinate the role agents.

The current session or primary agent is the coordinator; this is a responsibility, not a runtime-specific agent implementation.

## Hard Rules

- Every turn takes exactly one lane. Name it in one line, in the user's language.
- Answer is read-only: write nothing and create no artifact. When intent is unclear, ask one question and stay in Answer.
- SDD applies when several open decisions affect each other, or when the work is large. Work is large when it could not be resumed from the request and `git diff` alone. Counts of files or lines never decide it.
- Promote FTD to SDD by using its document as input. Never restart or discard completed work.
- Every role reads the project's `docs/`, its Brain, before it acts. Shared conventions live in the skills. Use Engram too when it is available, and save every objection there. Read the project with CodeGraph when it is available, before shell commands.
- When the user corrects a project convention, record it with `doc-create`.
- Check a task off only with observed proof. Record a check that failed, was skipped or could not run.
- Every code change passes the gate in `references/gate.md`. Only changes limited to documentation or configuration skip it.
- The coordinator may split a phase into independent contracted tasks. Parallel builders require separate branches and worktrees; never simulate isolation with instructions in a shared checkout.
- Builders may commit only to their assigned local task branch. They never push or integrate branches. The coordinator integrates task commits, resolves conflicts, runs seam checks and freezes the candidate before review.
- Keep roles responsibility-neutral. Runtime invocation details and optional model assignments belong in adapter or project/runtime configuration, not in this common workflow.
- Select reviewers using `references/review-matrix.md`; record the risk and rationale. The approver synthesizes required verdicts and cannot replace a missing or negative verdict.
- Stop after each phase, and wait for the user. There is no autopilot.
- The coordinator may create local integration commits. Only the user publishes or merges the approved candidate into its destination branch.

## Decision Gates

| The request | Lane |
| --- | --- |
| Asks to explain, compare, investigate, audit, review or propose | Answer |
| Authorizes a change that could be resumed from the request and `git diff`, with no interacting open decisions | FTD (the default for change) |
| Authorizes a change with several decisions that affect each other, or large work | SDD |
| Asks for a specific lane | That lane |

## Execution Steps

- **Answer:** Answer from evidence, and change nothing.
- **FTD:** Follow `references/ftd.md`: one feature document, then a contracted builder task or task set, then integration and the gate.
- **SDD:** Follow `references/sdd.md`: `spec-writer`, then one phase at a time; split independent tasks within a phase only when isolation is available, then integrate and gate the candidate.

## Output Contract

Report the lane, task branches and commits, integration candidate, each check with its observed result, selected reviewers and rationale, final approver block, and suggested final-delivery commit messages.

## References

- `references/ftd.md`: the default lane for change.
- `references/sdd.md`: the phase chain for interacting decisions or large work.
- `references/gate.md`: reviewers and approval.
- `references/task-contract.md`: task boundaries and builder handoff.
- `references/integration.md`: worktree setup, integration, seam checks and candidate freeze.
- `references/review-matrix.md`: reviewer selection by change surface and risk.
- `references/adapters/`: runtime capabilities and invocation details, separate from common workflow rules.
