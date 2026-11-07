# Motion guidance

Use motion only when it explains a change, confirms an action or preserves continuity. If removing an animation loses no information, remove it.

- Animate `transform` and `opacity`; avoid animating layout properties.
- Keep durations short for frequent, small interactions and longer only for large, infrequent transitions. Take durations and easings from the project's motion tokens.
- Use ease-out for elements entering or responding to input; avoid linear motion except for continuous progress.
- Start entering elements from a near-final state (slight offset or scale), not from nothing or from far away.
- Do not animate things users trigger many times a day, such as keyboard-driven actions and list navigation.
- Honor `prefers-reduced-motion`: replace movement with an instant change or a plain fade. State must stay understandable without motion.
- Never block input or content behind an animation.

When Emil Kowalski's skills are available, use them to review motion decisions and find justified opportunities, and follow `design-sources.md`.
