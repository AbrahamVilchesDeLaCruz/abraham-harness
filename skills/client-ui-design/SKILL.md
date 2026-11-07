---
name: client-ui-design
description: "Trigger: Whenever creating, restyling or reviewing a client screen, layout, component appearance, responsive behavior or motion. Builds a distinctive, polished interface from the product's existing brand and design system."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.1"
---

## Activation Contract

Use this skill for visual direction and implementation. Use `client-ux` for tasks, journeys and interaction behavior, and `client-accessibility` for a conformance review. Load both when a change spans those concerns.

If `brand.css` or a design system is missing, run `client-branding` first.

## Hard Rules

- Preserve the project's identity, tokens and patterns; never swap in a generic trend or a third-party default palette.
- Design from the content and job: one visual idea, one focal point, intentional hierarchy. Do not make every section a card or every element equally prominent.
- Use the brand's spacing scale as a rhythm (page, section, group, control); never one gap everywhere or raw values.
- Give headings, body, labels and metadata distinct roles; keep reading widths comfortable.
- Keep surfaces, borders, radius, shadows, color and motion purposeful and token-based.
- Cover default, hover, focus-visible, active, disabled, loading, empty, error and success states when applicable, understandable without color or motion alone.
- Design mobile first without sacrificing the wide composition. Prevent overflow, reserve media space, and use 44 by 44 CSS pixel targets when possible.
- Use semantic elements, visible focus and reduced-motion preferences; load `client-accessibility` for full review.
- A new or restyled screen is not done until you have run the critique loop in `references/critique-loop.md` on real captures. A checklist alone does not establish quality.
- Never claim visual verification without inspecting the running interface or screenshots.

## Decision Gates

| Situation | Action |
|---|---|
| Existing brand or design system | Keep its palette and type; improve layout, spacing and hierarchy within it |
| Brand is absent or incomplete | Run `client-branding` before implementation |
| Flow, information architecture or state behavior is unclear | Run `client-ux` before visual polish |
| Impeccable or another critique capability is available | Use it for the critique step of the loop; it never replaces looking at the captures |
| Other external design skill or Figma/browser tool is available | Use it as optional evidence; follow `references/design-sources.md` |
| The change adds or alters animation or transitions | Apply `references/motion.md` |
| Small component in an established screen | Inherit its composition and tokens |

## Execution Steps

1. Read `docs/brand.md`, `brand.css`, the relevant existing screens and common components.
2. Identify the screen's job, emphasis, content order, density and responsive changes. Load `client-ux` if flow or states need design.
3. Apply the visual craft checklist in `references/visual-craft.md`; implement from the smallest layout up using the existing tokens.
4. Verify all relevant states and keyboard focus. Load `client-accessibility` for a full accessibility check.
5. Run the critique loop in `references/critique-loop.md`: capture at narrow, medium and wide widths, critique, fix, and repeat for at most three rounds. If no browser or screenshot tool is available, report `visual inspection not run`. Use the project's stack skill for implementation details.

## Output Contract

Report the visual decisions, screens/components and states changed, token or component reuse, critique rounds run, viewports and tools actually inspected, open findings, and any unverified checks.

## References

- `references/visual-craft.md` — hierarchy, spacing, density, composition and finish checklist.
- `references/critique-loop.md` — mandatory capture, critique and fix loop.
- `references/motion.md` — when and how to animate.
- `references/design-sources.md` — optional Taste, Impeccable, Emil, Figma and browser-tool handoffs.
- `client-ux` — user jobs, flows, navigation and screen states.
- `client-accessibility` — keyboard, assistive technology and WCAG review.
