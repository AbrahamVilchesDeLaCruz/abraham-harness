# Discovery before specification

Run this after routing an FTD or SDD change request and before the spec writer or task contracts. The coordinator owns ordinary discovery and the user-facing questions; use a specialist only when the scope justifies another agent session. Answer-lane requests keep their read-only route.

## Explore once

Inspect the project Brain, relevant code and tests, current behavior, and existing decisions. Scale the search to uncertainty, affected surfaces, and risk: stop when the next decision can be made from evidence, and expand when dependencies or failure modes remain unclear. Record one short handoff in the FTD document or SDD plan directory:

- Goal and observed current behavior, with source paths.
- Affected surfaces, constraints, risks, and relevant brand or UI evidence.
- Decisions already supported by the request and project; assumptions and consequential unknowns.
- Likely task boundaries and checks. Link to sources instead of copying large excerpts.

Keep this handoff authoritative in the coordinator's plan directory. Before dispatching a role in another worktree or sandbox, give it a bounded digest of confirmed decisions and an accessible snapshot of any detailed handoff it needs. Copy the prototype directory with local assets when that role needs to inspect it, or verify that a shared path is readable from its workspace. Do not pass a path that only exists in the coordinator's checkout. Snapshots are task context, not competing sources to edit; update the authoritative handoff when evidence changes and refresh affected snapshots before dispatch. Recipients inspect relevant source files for their own work. Reviewers still verify the frozen candidate independently.

## Invite an interview

For every change request, ask once whether the user wants to answer discovery questions. The invitation is separate from the questions. If the user declines, record reversible assumptions and continue; ask a focused follow-up only if a consequential choice remains blocked. Silence is not a response.

On acceptance, present one logical batch of ten questions, or fewer if fewer useful decisions exist. Each numbered question has mutually exclusive A/B/C answers. Put the recommended answer in A and show it as preselected, with a short reason. Never pad a batch with trivia or silently submit A. Let the user change answers, accept all A recommendations, or skip remaining questions. At the end of the batch, offer another only if the user asks for it. A runtime with fewer than ten form controls may present the logical batch in a single readable message; do not multiply user interruptions merely to fit a tool limit.

Add the answers and skipped choices to the handoff. When an answer contradicts existing evidence, resolve the conflict before specification.

## Frontend design choice

For a frontend change with a material visual or interaction decision, ask separately whether the user wants to review a navigable HTML prototype or grant creative freedom. Ask after the interview decision, whether the interview was accepted or declined. If the user chooses review, follow `prototype.md` before specification. If the user grants creative freedom, record that decision and continue without a pre-spec approval stop; the production UI still gets the project's visual, UX, accessibility, and review checks. For a small change inheriting an established screen, record that no separate prototype is useful.

## Domain model choice

If exploration finds a change to aggregates, entities, Value Objects or their language, tell the owner briefly what changes and ask whether they want a domain diagram. Ask after the interview decision and before specification. Do not invoke `architect` or start the diagram before an explicit yes. If yes, follow `domain-model.md` and dispatch `architect`. If no, record the choice and continue without a diagram; builders and reviewers still apply the domain rules. If there is no domain-model change, do not ask. Carry accepted vocabulary, invariants and type decisions into later phase handoffs.
