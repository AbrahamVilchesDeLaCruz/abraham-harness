# Palette method

## Build the colors

1. Start from the user's fixed color. Without one, choose a hue that fits the personality, and say why.
2. Derive `primary`, `accent`, and a neutral ramp from `background` to `text`. Tint the neutrals slightly toward the primary hue.
3. Choose feedback colors that stay distinguishable without hue alone: `success` green, `warning` amber, `danger` red, `info` blue, each with a readable on-color.
4. Pick `on-primary` and `on-accent` by contrast, not by taste.

## Compute contrast

Relative luminance of an sRGB color, with each channel `c` in 0..1:

```text
lin = c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
L = 0.2126 * R + 0.7152 * G + 0.0722 * B
ratio = (Llighter + 0.05) / (Ldarker + 0.05)
```

Check at least these pairs, in light and in dark:

| Foreground | Background | Minimum |
| --- | --- | --- |
| `text` | `background`, `surface` | 4.5 |
| `text-muted` | `background`, `surface` | 4.5 |
| `on-primary` | `primary` | 4.5 |
| `on-accent` | `accent` | 4.5 |
| `primary` as a link | `background` | 4.5 |
| `border`, `focus-ring` | `background`, `surface` | 3 |

Use `border-subtle` only for decoration or grouping, never as the only boundary of an essential control. When primary is also used for links, check it as text against each surface; choose a role-specific accessible link token if needed rather than assuming an action color is readable at text size.

Run the formula in a script outside the project, and report the ratios. If a pair fails, change the lighter or darker color, not the threshold.

## Build the type scale

Use a ratio between 1.125 and 1.25 from a base of 1rem. Keep the body line height near 1.5, and the heading line height near 1.2.
