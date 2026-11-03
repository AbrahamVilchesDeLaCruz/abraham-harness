---
name: client-branding
description: "Trigger: When creating or changing a brand's visual identity, or before building UI in a client with no brand file. Creates the brand brief and the design tokens that every component uses."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

Use this skill when the user asks for a brand, a visual identity, a design system or a restyle, and before you build UI in a client that has no brand file.

It produces two files:

- `docs/brand.md`: the brief, with the personality, the voice, the reason for each choice, and the token names. Copy `assets/brand.template.md`.
- `apps/client/src/styles/brand.css`: the design tokens as CSS custom properties, and the only place that holds their values. Copy `assets/tokens.template.css`.

## Hard Rules

- Never invent a brand the user already has. Use the colors, fonts and logo the user gives you, and complete only what is missing.
- Every color, font, size, space, radius, shadow and duration in the UI comes from a token in `brand.css`. A raw value in a component is a defect.
- Name tokens by role (`--color-primary`, `--color-surface`, `--color-danger`), never by appearance (`--color-blue`).
- Each text and background pair that the UI uses meets WCAG AA: 4.5:1 for text, 3:1 for large text and for borders of controls. Compute the ratios, and do not estimate them. See `references/palette.md`.
- Define light and dark values for every color token, or state in `docs/brand.md` that the brand has no dark theme.
- `docs/brand.md` names tokens and never repeats their values, so there is one source of truth.
- Fonts need a fallback stack. Prefer a system font or an open-licensed font, and say which in the brief.

## Decision Gates

| Situation | Action |
| --- | --- |
| The user has a brand guide, a logo or hex colors | Read them, and build the tokens from them |
| The user has only a product idea | Ask the questions in step 1, then propose one direction |
| `brand.css` already exists | Update it and the brief. Do not create a second file |
| A component needs a value no token has | Add a token to `brand.css` and to the brief, then use it |

## Execution Steps

1. Ask once, in one message: what the product does, who uses it, three adjectives for the personality, one or two brands the user likes, and any fixed color, font or logo.
2. Choose the direction, and give the reason for each choice in the brief. Offer one direction, not a menu.
3. Build the palette and the type scale with `references/palette.md`.
4. Write `brand.css` and `docs/brand.md` from the templates, and add `brand.md` to the map in `docs/README.md`.
5. Load the stack skill and read its `references/client-branding.md`, so the tokens reach the styling tool and are imported once at the app's entry.
6. Verify every contrast pair, and show the user a short table of the roles with their ratios.

## Output Contract

Return the two file paths, the contrast table, and every assumption you made.
