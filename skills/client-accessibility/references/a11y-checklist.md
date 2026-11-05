# Client accessibility checklist

Use the checks that apply to the changed components and the complete user journey. Automated scans cover only a subset of access barriers.

## Semantics and names

- Use buttons for actions, links for navigation, labels for fields and headings in a logical hierarchy.
- Every control has one clear accessible name. Associate hints, validation errors and status with the relevant control.
- Custom controls expose current state as well as name and role. Decorative imagery is hidden from assistive technology; informative images have useful alternatives.
- Use live announcements only for changes users need to know without moving focus; prefer polite announcements unless interruption is essential.

## Keyboard and focus

- Tab reaches every interactive control in a meaningful DOM order; Enter/Space operate it as appropriate.
- Focus is visible, never obscured by sticky UI, and moves predictably when content changes.
- Dialogs and menus place focus on entry, contain it while modal, close with Escape when appropriate, and return focus to their trigger.
- Dragging has a single-pointer alternative. Do not use positive `tabindex` to repair a broken order.

## Visual access and motion

- Measure text and essential graphical/control contrast in each theme and state. Do not rely on hue alone for status or errors.
- Test reflow at narrow widths and 200% zoom/text enlargement; preserve access to content and actions.
- Respect reduced-motion preferences. Animation must not block input or be the only signal of a state change.
- Keep touch targets at least 24 by 24 CSS pixels, with spacing exceptions checked; prefer 44 by 44 when practical.

## Verification evidence

| Check | Evidence |
|---|---|
| Automated accessibility scan, if installed | Tool, route/state and reported violations |
| Keyboard-only walkthrough | Flow and overlays exercised, focus issues observed |
| Contrast | Measured foreground/background pairs, including interactive states |
| Zoom and reflow | Width/zoom tested and any loss or overflow |
| Assistive technology, when available | Reader/browser used and names/states/errors sampled |

Passing one automated scan does not prove WCAG conformance. State what was not tested; do not convert unavailable checks into passes.
