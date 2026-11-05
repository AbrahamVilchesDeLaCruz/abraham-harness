---
name: client-branding
description: "Trigger: When creating, completing or changing a product's visual identity, design tokens or brand system, and before UI work when no brand system exists. Keeps brand decisions and implementation tokens in sync."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## Activation Contract

Use this skill when the user asks for a brand, a visual identity, a design system or a restyle, and before you build UI in a client that has no brand file.

It produces two files:

- `docs/brand.md`: the brief, with the personality, the voice, the reason for each choice, and the token names. Copy `assets/brand.template.md`.
- `apps/client/src/styles/brand.css`: the design tokens as CSS custom properties, and the only place that holds their values. Copy `assets/tokens.template.css`.

## Hard Rules

- Never invent a brand the user already has. Use the colors, fonts and logo the user gives you, and complete only what is missing.
- Every color, font, size, space, radius, shadow and duration in the UI comes from a token in `brand.css`. A raw value in a component is a defect.
- Define tokens by semantic role and usage, including a usable spacing rhythm, typography roles, interactive borders, focus and feedback states. Decorative subtle borders are not control borders.
- Name tokens by role (`--color-primary`, `--color-surface`, `--color-danger`), never by appearance (`--color-blue`).
- Each text/background pair meets WCAG AA: 4.5:1 for normal text, 3:1 for large text and 3:1 for essential control boundaries and focus indicators. Compute ratios; do not estimate. See `references/palette.md`.
- Define light and dark values for every color token, or state in `docs/brand.md` that the brand has no dark theme.
- `docs/brand.md` names tokens and never repeats their values, so there is one source of truth.
- Fonts need a fallback stack. Prefer a system font or an open-licensed font, and say which in the brief.
- `docs/brand.md` records the intent and token names, not a second copy of token values. `brand.css` is the single source of values.

## Decision Gates

| Situation | Action |
| --- | --- |
| The user has a brand guide, a logo or hex colors | Read them, and build the tokens from them |
| The user has only a product idea | Ask the questions in step 1, then propose one direction |
| `brand.css` already exists | Update it and the brief. Do not create a second file |
| A repeated design need has no token | Add a semantic token to `brand.css` and document its role in the brief before use |

## Execution Steps

1. Ask once, in one message: what the product does, who uses it, three adjectives for the personality, one or two brands the user likes, and any fixed color, font or logo.
2. Choose the direction, and give the reason for each choice in the brief. Offer one direction, not a menu. Record spacing/density and hierarchy principles as guidance, without duplicating component-level implementation.
3. Build the palette and the type scale with `references/palette.md`.
4. Write `brand.css` and `docs/brand.md` from the templates, and add `brand.md` to the map in `docs/README.md`.
5. Load the stack skill and read its `references/client-branding.md`, so tokens are imported once and mapped to the styling system without duplicating values.
6. Verify every contrast pair, and show the user a short table of the roles with their ratios.

## Output Contract

Return the two file paths, the contrast table, and every assumption you made.
