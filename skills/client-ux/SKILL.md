---
name: client-ux
description: "Trigger: When designing or reviewing a client journey, navigation, form, onboarding, interaction, screen state or recovery path. Makes product workflows understandable and efficient before visual polish."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

Use this skill for the user's job, end-to-end flow and interaction behavior. Use `client-ui-design` for visual composition and `client-accessibility` for a conformance review. Load them together when changing a complete screen or journey.

## Hard Rules

- Begin with the user, their goal, what completion looks like and the cost of failure. Ask only when an unknown changes the flow or risk.
- Map the journey before polishing screens. Include entry, completion, return visits, cancellation, failure and recovery where they apply.
- Every screen makes clear where the user is, what matters, what actions are available and what happens next.
- Give each screen one primary job. Choose controls and navigation that fit that job; do not add steps, choices or confirmation dialogs without a reason.
- Design states deliberately: initial, loading, empty, filtered-empty, partial, success, error, offline, unauthorized, pending and overflow as applicable.
- Prevent avoidable errors with sensible defaults and inline guidance. Preserve user input after failure; offer retry, undo or a clear next action when appropriate.
- Keep copy specific, concise and consistent with `docs/brand.md`. Do not hide important status in color, hover-only content or transient messages.
- Use `client-accessibility` for keyboard, semantics, focus, assistive technology and WCAG checks; use `client-ui-design` to express the resulting hierarchy visually.

## Decision Gates

| Situation | Action |
|---|---|
| User job or success condition unclear | Ask one focused question before locking the flow |
| Existing flow is being changed | Preserve working routes and identify affected states before editing |
| Flow includes irreversible or destructive action | Make consequence clear and provide safe recovery where possible |
| Screen pattern is unclear | Choose from the job: list, detail, form, search, dashboard, settings or focused overlay |

## Execution Steps

1. Read `docs/`, the relevant project decisions, `docs/brand.md` and the current interface.
2. State the user/job/success/risk briefly and map steps, screens and transitions.
3. Use `references/flow-state-matrix.md` to enumerate relevant states and recovery paths.
4. Implement the smallest coherent flow. Coordinate visual work with `client-ui-design` and accessibility with `client-accessibility`.
5. Walk the main journey and one meaningful failure path with the available browser or test tools; report what could not be exercised.

## Output Contract

Return the user/job, changed flow and screens, primary action per screen, states and recovery paths covered, checks actually performed and unresolved questions.

## References

- `references/flow-state-matrix.md` — journey map and per-screen state checklist.
- `client-ui-design` — visual hierarchy, spacing, density and responsive composition.
- `client-accessibility` — semantic interaction and accessibility verification.
