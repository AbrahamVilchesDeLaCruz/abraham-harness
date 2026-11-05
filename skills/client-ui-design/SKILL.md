---
name: client-ui-design
description: "Trigger: Whenever creating, restyling or reviewing a client screen, layout, component appearance, responsive behavior or motion. Builds a distinctive, polished interface from the product's existing brand and design system."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## Activation Contract

Use this skill for visual direction and implementation. Use `client-ux` for tasks, journeys and interaction behavior, and `client-accessibility` for a conformance review. Load both when a change spans those concerns.

If `brand.css` or an established design system is missing, run `client-branding` first. Read the project's `docs/brand.md`, relevant existing screens and shared components before proposing a visual direction.

## Hard Rules

- Preserve the project's identity, tokens and useful patterns. Do not replace a coherent brand with a generic trend or a third-party skill's default palette.
- Design from the content and job. Establish a visual idea, one clear focal point, and an intentional hierarchy before styling details. Do not make every section a card or every element equally prominent.
- Use the brand's spacing scale as a rhythm: distinguish page, section, group and control spacing. Choose density for the task; do not use one gap everywhere or invent raw values.
- Give headings, body, labels and metadata distinct roles. Keep reading widths comfortable and long content, localization and zoom in mind.
- Make surfaces, borders, radius, shadows, color and motion purposeful and token-based. Avoid decoration that competes with content.
- Cover default, hover, focus-visible, active, disabled, loading, empty, error and success states when applicable. Keep state changes understandable without color or motion alone.
- Design mobile first without sacrificing the wider composition. Prevent overflow and reserve image/media space. Make touch targets comfortable; use 44 by 44 CSS pixels when the component can support it.
- Use semantic elements, visible focus and reduced-motion preferences. Load `client-accessibility` for the full keyboard, screen-reader, zoom and WCAG review.
- Do not claim visual verification unless you inspected the running interface or screenshots. If browser tooling is unavailable, report the limitation and use the strongest available source evidence.

## Decision Gates

| Situation | Action |
|---|---|
| Existing brand or design system | Keep its palette and type; improve layout, spacing and hierarchy within it |
| Brand is absent or incomplete | Run `client-branding` before implementation |
| Flow, information architecture or state behavior is unclear | Run `client-ux` before visual polish |
| External design skill or Figma/browser tool is available | Use it as optional evidence; follow `references/design-sources.md` |
| Small component in an established screen | Inherit its composition and tokens; do not invent a new visual system |

## Execution Steps

1. Read `docs/brand.md`, `brand.css`, the relevant existing screens and common components.
2. Identify the screen's job, primary emphasis, content order, density and responsive changes. Load `client-ux` if the flow or states need design.
3. Apply the visual craft checklist in `references/visual-craft.md`; implement from the smallest layout up using the existing tokens.
4. Verify all relevant states and keyboard focus. Load `client-accessibility` for a full accessibility check.
5. Inspect the real screen at narrow, medium and wide widths when a browser or screenshot tool is available. Use the project's stack skill for implementation details.

## Output Contract

Report the visual decisions, screens/components and states changed, token or component reuse, viewports and tools actually inspected, and any unverified checks.

## References

- `references/visual-craft.md` — hierarchy, spacing, density, composition and finish checklist.
- `references/design-sources.md` — optional Taste, Impeccable, Emil, Figma and browser-tool handoffs.
- `client-ux` — user jobs, flows, navigation and screen states.
- `client-accessibility` — keyboard, assistive technology and WCAG review.
