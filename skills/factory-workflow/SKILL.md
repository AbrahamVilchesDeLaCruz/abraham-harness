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

- Every turn takes exactly one lane. Answer is read-only. Infer intent and make reasonable assumptions; ask only when missing information materially blocks progress.
- For FTD and SDD, run `references/discovery.md` before specification. Ask about open product decisions; keep applicable domain-diagram and frontend-prototype choices separate.
- SDD applies when decisions interact or work cannot be resumed from the request and `git diff` alone. Promote FTD to SDD using its document as input.
- Follow project `AGENTS.md`, `docs/` and target-repository policy. These, plus the current user's explicit instruction, outrank generic/user-global skill defaults. A project CI-only verification rule overrides shared local full-suite defaults; do not import another repository's issue, label, size or publication rules.
- Every role reads the relevant project Brain entries and shared skills, and records observed evidence for checks. Pass one source-linked discovery handoff forward; reviewers verify the candidate independently. Use CodeGraph when useful for source exploration.
- Review the final feature diff and high-risk phases under `references/gate.md`. Editorial docs and inert metadata skip the code gate. Select reviewers with `references/review-matrix.md`.
- Keep small work inline or serial. Parallel builders require verified isolated workspaces. Only the coordinator integrates or publishes.
- The coordinator integrates authorized task commits, resolves conflicts, runs seam checks and freezes the candidate before review.
- A requested implementation authorizes local task commits and integration into its existing working branch when needed, subject to project policy and runtime permissions. Follow `references/publication-authorization.md` for feature branches, first push, final PR and merge authority.
- Keep the Markdown plan or FTD checklist and evidence in sync. Resume against Git and CI as described in `references/integration.md`. Continue technical work autonomously within the authorized outcome and scope.
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
- **SDD:** Follow `references/sdd.md`: specify and plan, then implement within the requested scope; parallelize only independent isolated tasks.

## Output Contract

Report the lane, task branches/commits, frozen integration candidate, checks, reviewer selection/verdicts, and any authorized delivery actions with their observed results.

## References

- `references/ftd.md`, `references/sdd.md` — lanes and phases.
- `references/discovery.md`, `references/domain-model.md`, `references/prototype.md` — proportionate pre-spec exploration, optional interview, domain model and visual direction.
- `references/task-contract.md`, `references/integration.md` — task isolation, integration and seam checks.
- `references/publication-authorization.md`, `references/pull-request.md` — delivery authorization and PR evidence.
- `references/gate.md`, `references/review-matrix.md` — review and approval.
- `references/adapters/` — runtime capabilities, separate from common rules.
