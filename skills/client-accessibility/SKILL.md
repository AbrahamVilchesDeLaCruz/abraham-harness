---
name: client-accessibility
description: "Trigger: When building or reviewing interactive client UI for keyboard access, screen readers, contrast, focus, motion, zoom or WCAG conformance. Verifies accessibility with automated and manual checks."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

Use this skill when implementing an interactive UI, fixing an accessibility issue or auditing conformance. Apply it with `client-ui-design` and `client-ux`; this skill verifies access, not the visual direction or user journey.

## Hard Rules

- Prefer native HTML semantics. Use ARIA only when native elements do not express the interaction, and then provide the required name, role, value and keyboard behavior.
- Every action works without a pointer. Check logical focus order, visible focus, Escape behavior and focus return for dialogs or other overlays.
- Give each control a persistent accessible name. Associate instructions and errors programmatically; a placeholder alone is not a label.
- Never use color, position, sound or motion as the only way to convey meaning. Respect reduced-motion preferences and avoid unexpected movement.
- Measure contrast: 4.5:1 for normal text, 3:1 for large text and essential control/graphic boundaries. Use the brand's on-color tokens and check actual combinations.
- Meet WCAG 2.2 AA target sizing: 24 by 24 CSS pixels or a documented spacing exception. Prefer the 44 by 44 comfort target from `client-ui-design` when feasible.
- Check text enlargement/200% zoom, narrow viewports, long content and localization for clipping, loss of function or unnecessary horizontal scrolling.
- Automated scans are necessary evidence when available, never proof of conformance. Report manual checks and unavailable tools honestly; do not add dependencies without project approval.

## Decision Gates

| Situation | Action |
|---|---|
| Native element fits the interaction | Use it before considering custom ARIA behavior |
| Custom widget or overlay | Load its keyboard/focus pattern from `references/a11y-checklist.md` |
| Accessibility scan tool is already installed | Run it on representative rendered states and fix violations |
| No browser or scan tool is available | Perform code and manual reasoning checks; report the missing verification |

## Execution Steps

1. Identify affected user tasks, controls, states and existing project accessibility rules.
2. Review semantics, accessible names, focus behavior, errors, contrast and reduced motion using `references/a11y-checklist.md`.
3. Run available static or browser-based checks on representative normal and error states.
4. Manually walk the flow with keyboard-only interaction and check zoom/responsive behavior when possible.
5. Fix findings, rerun checks and report exact evidence and any unverified criteria.

## Output Contract

Return tools/checks run, manual paths exercised, findings fixed, remaining WCAG/accessibility risks and anything that could not be tested.

## References

- `references/a11y-checklist.md` — practical keyboard, focus, contrast, text and assistive-technology checks.
- `client-ux` — user journeys, control purpose and recovery.
- `client-ui-design` — visual system and responsive rules.
