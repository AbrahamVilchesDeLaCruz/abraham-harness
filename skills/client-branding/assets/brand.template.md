# Brand

Tokens live in `apps/client/src/styles/brand.css`. This document gives the reasons and the token names, and never repeats a value.

## Identity

- Product: what it does and who uses it.
- Personality: three adjectives.
- Voice: how the interface speaks, with one example message.
- References: brands the user likes, and what to take from each.

## Color

| Token | Role | Reason |
| --- | --- | --- |
| `--color-primary` | Main actions and links | |
| `--color-primary-hover` | Hovered primary action | |
| `--color-on-primary` | Text and icon on primary | |
| `--color-accent` / `--color-on-accent` | Secondary emphasis | |
| `--color-background` / `--color-surface` | Page and grouped content | |
| `--color-border` / `--color-border-subtle` | Controls / decorative separators | |
| `--color-text` / `--color-text-muted` | Main and supporting text | |
| `--color-success` / `--color-warning` / `--color-danger` / `--color-info` | Feedback states | |
| `--color-focus-ring` | Keyboard focus indicator | |

## Typography

- Fonts and their source (system or open license):
- Heading, body, label and data roles:
- Scale, line-height and the use of each size:

## Shape, depth and motion

- Radius, shadow and motion: what each says about the personality.

## Layout and density

- Spacing scale: the token names and how it separates control groups, sections and page regions.
- Reading width and alignment:
- Density by task (for example, scanning data versus first-run setup):

## Rules for UI

- Use only tokens from `brand.css`.
- `brand.css` is the only source of token values; this brief explains roles and reasons.
- Use the spacing scale to create hierarchy. Do not repeat token values in this document.
- Keep subtle decorative separators distinct from borders that communicate a control boundary.
- Add a semantic token here and in `brand.css` before a repeated design need requires it.

## Assumptions

- Anything the user did not confirm.
