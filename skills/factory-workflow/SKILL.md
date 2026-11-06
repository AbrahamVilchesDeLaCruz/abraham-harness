---
name: factory-workflow
description: "Trigger: On every request in a project that uses this harness. Routes work, coordinates isolated tasks and gates candidates with relevant reviews."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "4.0"
---

## Activation Contract

Use this skill to route every request and coordinate the role agents. The current session or primary agent is the coordinator; this is a responsibility, not a runtime-specific agent implementation.

## Hard Rules

- Every turn takes exactly one lane. Answer is read-only; ask one question when intent is unclear.
- SDD applies when decisions interact or work cannot be resumed from the request and `git diff` alone. Promote FTD to SDD using its document as input.
- Follow project `AGENTS.md`, `docs/` and target-repository policy. These, plus the current user's explicit instruction, outrank generic/user-global skill defaults; do not import another repository's issue, label, size or publication rules.
- Every role reads the project Brain, uses shared skills for shared conventions, and records observed evidence for checks. Read with CodeGraph when available before shell exploration.
- Every code change passes `references/gate.md`; only documentation/configuration-only changes skip it. Select reviewers with `references/review-matrix.md`.
- The coordinator may split a phase into contracted tasks. Parallel builders require separate branches and worktrees; otherwise run serially. Builders commit only to assigned local task branches and never push or integrate.
- The coordinator integrates authorized task commits, resolves conflicts, runs seam checks and freezes the candidate before review.
- Push, PR creation, parent-branch integration and PR merge are not authorized by default. Perform only operations specifically authorized by the user for named refs and conditions, as defined in `references/publication-authorization.md`.
- Stop after each phase unless its next integration/delivery actions were authorized in advance; then perform only those actions and report evidence.
- Keep roles responsibility-neutral. Runtime invocation details and optional model assignments belong in adapter or project/runtime configuration.

## Decision Gates

| Request | Lane |
|---|---|
| Explain, compare, investigate, audit, review or propose | Answer |
| Authorized change resumable from request + `git diff`, no interacting decisions | FTD |
| Interacting decisions or work too large to resume from request + `git diff` | SDD |
| User names a lane | That lane |

## Execution Steps

- **Answer:** Use evidence; write nothing.
- **FTD:** Follow `references/ftd.md`, contract task(s), integrate and run the applicable gate.
- **SDD:** Follow `references/sdd.md`: specify and plan, then implement one phase at a time; parallelize only independent isolated tasks.

## Output Contract

Report the lane, task branches/commits, frozen integration candidate, checks, reviewer selection/verdicts, and any authorized delivery actions with their observed results.

## References

- `references/ftd.md`, `references/sdd.md` — lanes and phases.
- `references/task-contract.md`, `references/integration.md` — task isolation, integration and seam checks.
- `references/publication-authorization.md` — scoped branch integration and remote authorization.
- `references/gate.md`, `references/review-matrix.md` — review and approval.
- `references/adapters/` — runtime capabilities, separate from common rules.
