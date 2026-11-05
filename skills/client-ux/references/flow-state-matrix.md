# Flow and screen-state matrix

Use a compact table to make behavior reviewable before implementation.

## Journey map

| Step | User and context | User goal/action | System response | Next step or exit | Failure/recovery |
|---|---|---|---|---|---|
| 1 | First-time or returning user | What they do | What changes or is confirmed | Where they go | How they recover |

Include only lifecycle steps relevant to the feature: entry, first value, normal use, edit/cancel, limits or permissions, failure/offline, and return after interruption. Include other roles only when they participate in this flow.

## Per-screen state matrix

| Screen | Initial | Loading | Empty / no results | Partial / populated | Error / offline | Success / pending | Permission / overflow | Recovery / next action |
|---|---|---|---|---|---|---|---|---|
| `<screen>` | relevant? | relevant? | relevant? | relevant? | relevant? | relevant? | relevant? | visible action |

Mark a state not applicable only when the screen cannot enter it. Distinguish a genuinely empty account from a filtered search with zero results. Identify retained input, retry, undo, cancellation or alternative routes for failures.

## Screen contract

For each screen, record:

- user goal and the point at which the task is complete;
- the primary action, or the intended reading/monitoring order if there is no action;
- the content and status that must remain visible;
- back, cancel and recovery behavior;
- keyboard and assistive-technology considerations to check with `client-accessibility`.
