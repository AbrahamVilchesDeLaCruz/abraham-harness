Objective: raise the quality of every skill without changing what it says. Branch: feat/skill-quality (stacked on feat/multi-agent-installer).
Delivery: single-pr, one commit per unit. Test runner: node --test plus scripts/validate-skills.mjs.
Baseline: 35fdc8fa8264f42a61d54ffef04b4c33a56547bf

## Specs

- S1. "tendríamos que revisar todas las skills para mejorarlas manteniendo lo que dicen ahora."
- S2. Assumption (the parent's reading of "mejorarlas"): each SKILL.md follows the LLM-first style guide bundled with skill-improver: frontmatter description is one quoted line of at most 250 characters and keeps its trigger text; sections are in the order Activation Contract, Hard Rules, Decision Gates, Execution Steps, Output Contract, References; the body stays within 4000 characters.
- S3. Assumption (the parent's reading of "manteniendo lo que dicen"): no rule, trigger, example or code block is removed or changed in meaning. Long content moves to local references/ or assets/. Each skill keeps its current language; section headings use the style guide's English names. Rules that conflict or are unclear are reported, not rewritten.
- S4. Checks: content-guard reports lostCode=0 and lostInline=0 for the skill, every reworded prose line keeps its meaning, and validate-skills reports no problem for the skill.

## Tasks

- [x] T1 (05c7122) S1-S4 api-core: api-application, api-criteria, api-di, api-domain, api-error-handler, api-infrastructure, api-response, api-rest, api-shared, api-validation. Route: delegated, parallelism.
- [x] T2 (237627b) S1-S4 api-platform: api-auth, api-bc-review, api-domain-events, api-events, api-events-infra, api-migrations, api-observability, api-testing. Route: delegated, parallelism.
- [x] T3 (850dca6) S1-S4 client: client-api, client-container-presentational, client-hooks, client-pods, client-query, client-testing. Route: delegated, parallelism.
- [x] T4 (9729a11) S1-S4 workflow: git-workflow, project-bootstrap, skill-creator, skill-sync, tdd-workflow. Route: delegated, parallelism.
- [x] T5 (independent verifier failed 5 blockers, corrected and rechecked) S1-S4 independent verification over the whole feature. Risk: item 6, no test catches a change of meaning in prose.

## Log

- L1 (2026-11-02): "necesito que el instalador las meta en claude code en codex y opencode. y tendríamos que revisar todas las skills para mejorarlas manteniendo lo que dicen ahora."
- L2: Installer delivered on feat/multi-agent-installer, commit 5837670, verified with npx from the GitHub branch. Engram mirror pending: no Engram tool is available in this session.
- L3 (2026-11-02): "si, buscaba hacerlas más eficientes, que mantengan al 100% el standard del código." This confirms S2 and S3: efficiency means smaller bodies loaded per skill, and code standards stay unchanged.
- L4 (2026-11-02): "me gustaría los roles de IA factory cómo tienen en: https://github.com/ericrisco/rsc-harness (spec-writter / planner, builder, security, UX, UI, code-reviewer, estos últimos 4 deben estar positivos para que el approver de cómo buena)"
- L5: T5 found 5 blockers: corrupted text in api-observability and api-bc-review, and changed meaning in api-validation (two rules) and api-rest (one). All corrected and rechecked. skill-creator lostCode=3 is confirmed as the requested template alignment plus one guard misparse. SKILL.md bodies went from 148701 to about 93000 bytes.
- L6: Open for the user: contradictions already in the baseline, such as `@Type()` in Payloads, 201 versus 200 status codes, and `limit`/`offset` versus `page`/`pageSize`. api-validation also has two baseline rules about explicit `null`, one with the qualifier "con validaciones adicionales".
