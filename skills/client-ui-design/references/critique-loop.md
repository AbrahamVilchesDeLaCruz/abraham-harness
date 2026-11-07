# Visual critique loop

A checklist is satisfied on paper; a screen is judged by looking at it. This loop is mandatory for any new or restyled screen. It works with no external tool; Impeccable or another critique capability, when available, sharpens step 2 but never replaces it.

## 1. Capture

- Render the real screen with representative content (long labels, many items, empty and error states).
- Capture narrow (about 375px), medium (about 768px) and wide (about 1280px) widths, full page, not only the first viewport.
- Open every capture and look at it. If no browser or screenshot tool exists, stop the loop and report `visual inspection not run: <reason>`. Never describe a screen you did not see.

## 2. Critique

Write findings against the captures, each tied to a place on screen. Judge:

| Lens | Ask |
|---|---|
| Focal point | Does the eye land on the one intended thing within a second? |
| Hierarchy | Are there three or fewer emphasis levels, and do size, weight and contrast agree? |
| Rhythm | Do gaps vary by meaning (label/value, control group, section) rather than being uniform? |
| Typography | Are roles distinct, line lengths readable, metadata subordinate but legible? |
| Composition | Is it expressive of the product, or a familiar template filled with cards? |
| Surfaces | Are containers, borders, shadows and radii earning their place? |
| Content | Is every string and image real and specific, with no filler? |
| Responsiveness | Any overflow, clipping, awkward wraps or cramped targets at any width? |

Common tells of unfinished work: equal-weight sections, everything in a card, nested containers, repeated pill badges, decorative gradients, icon tiles with no meaning, centered everything, low-contrast metadata, and one gap value used everywhere.

## 3. Fix and repeat

- Fix the highest-impact findings first, using existing tokens. Recapture and re-critique.
- At most three rounds. Stop earlier when a round finds nothing meaningful.
- Remaining findings go in the report as open items; do not hide them.

## 4. Report

State the rounds run, the widths captured, the findings fixed, the findings left open, and any lens you could not judge.
