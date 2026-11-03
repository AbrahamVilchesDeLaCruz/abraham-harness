Objective: planner and builder modeled on Codely, flow modeled on rsc-harness, and skills in English separated from frameworks. Branch: feat/lanes-flow, then feat/stack-skills stacked on it.
Delivery: one PR per delivery. Test runner: node --test.

## Specs

- S1. "para el planner y builder estaría bien cómo hacen los de codely."
- S2. "Y para el flow lo que hace el chico de ericrisco."
- S3. "siento que las skills mías en castellano pueden perder eficiencia y están demasiado casadas al framework en su verisón actual."
- S4. "quiero mantener toda esa separación de conceptos ddd, hexagonal, object mothers, domain-events, excepccions. ports-adapters, use-cases, domain services, value-objects etc"
- S5. User decision: separate stack skills ("Skills de stack aparte"). Concept skills name no framework, and stack skills carry no pinned version.
- S6. User decision: no autopilot ("Parar en cada fase"). The builder stops after each phase and never commits.
- S7. User decision: the four reviewers and the approver gate every code change ("Todo cambio de código"). Only documentation or configuration changes skip the gate.
- S8. Assumption: since the builder does not commit, the candidate is the staged tree from `git write-tree`.
- S9. Assumption: blocking findings go to a `finding-verifier`, as in rsc-harness. A reviewer counts as positive when all its blocking findings are refuted, and every refuted finding is listed for the user.

## Tasks

- [x] T1 S1 S2 S6-S9 lanes, plan skills and agents. Route: inline, no writer reason.
- [x] T2 S3-S5 concept skills in English, stack skills. Route: delegated, parallelism.
- [x] T3 S3-S5 independent verification. Risk: item 6, no test catches a change of meaning in prose.

## Log

- L1 (2026-11-02): "para el planner y builder estaría bien cómo hacen los de codely. Y para el flow lo que hace el chico de ericrisco. Además siento que las skills mías en castellano pueden perder eficiencia y están demasiado casadas al framework en su verisón actual. Sin embargo quiero mantener toda esa separación de conceptos ddd, hexagonal, object mothers, domain-events, excepccions. ports-adapters, use-cases, domain services, value-objects etc"
- L2: Engram mirror pending: no Engram tool is available in this session.
- L3: T3 found 11 blockers: two rules mistranslated by a global rename, Spanish left in two files, a broken neutral query example, framework names and source-project terms the validator missed, and two sections with no baseline source. All corrected, and the validator now rejects those names. Recheck limited to these blockers.
- L4 (2026-11-03): "Igual se me ha entendido mal. el flujo es:" followed by a diagram: Brain above the chain; Spec writer (Opus) to Builder (Opus); Builder to Seguridad (Sol), UX (Sol), UI (Astra) and Código (Sonnet) in parallel; all four to Approver (Opus); on a rejection, "Vuelve al builder."
