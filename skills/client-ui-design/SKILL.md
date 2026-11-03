---
name: client-ui-design
description: "Trigger: When building or changing a screen, layout, component's look, state, animation or responsive behavior. Rules for modern, accessible interfaces built from the brand tokens."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

Use this skill when you build or change how an interface looks, lays out, responds or moves. It builds on `client-branding`: the tokens in `brand.css` give the values, and this skill gives the rules to use them.

If the client has no `brand.css`, run `client-branding` first.

## Hard Rules

- Every view has one primary action, and its visual weight is clearly higher than any other. Order the rest by importance with size, weight, color and space, not decoration.
- Build mobile first. A layout works from 320px to wide screens without horizontal scroll, with fluid sizes and flexible tracks. No fixed widths on containers.
- Components that live in different slots adapt to their container, not to the viewport. Use container queries for them.
- Every interactive element has these states, drawn from tokens: default, hover, focus-visible, active, disabled and, when it waits, loading. The focus ring is always visible and meets 3:1.
- Every view that loads data has a skeleton or a loading state, an empty state with a next action, and an error state with a retry. None of them shifts the layout.
- Touch targets are at least 44 by 44 CSS pixels, with space between them.
- Use semantic elements first: `button` for actions, `a` for navigation, `label` for each field, headings in order. Add ARIA only when no element fits.
- Animate only `transform` and `opacity`, with the duration and easing tokens. Motion explains a change, and never blocks input. Honor reduced motion.
- Respect the user's color scheme and text size. Size text in relative units, and leave 60 to 75 characters per line for reading text.
- Reserve space for images and embeds with an aspect ratio, so the page does not jump while it loads.
- Do not add shadows, gradients, blurs or animations that carry no meaning. Never put text on an image without a guaranteed contrast.

## Decision Gates

| Situation | Choose |
| --- | --- |
| Two-dimensional layout | Grid |
| One row or column of items | Flex |
| A component shown in sidebars and in main areas | Container query |
| A page-wide change | Media query |
| Size or space that must scale smoothly | Fluid value with a minimum and a maximum |
| A change the user must notice | Motion, with a non-motion cue as well |

## Execution Steps

1. Confirm that `brand.css` exists, and read `docs/brand.md`.
2. Sketch the hierarchy in words: the primary action, the content order, and what collapses on a phone.
3. Build the smallest layout first, then widen it, and verify at 320px, 768px and 1280px.
4. Add every state in the Hard Rules, and check the keyboard path.
5. Load the stack skill and read its `references/client-ui-design.md` for the tools.
6. Check contrast, focus and reduced motion before you hand the work over.

## Output Contract

Return the views or components changed, the widths you verified, and any state or rule you could not meet.
