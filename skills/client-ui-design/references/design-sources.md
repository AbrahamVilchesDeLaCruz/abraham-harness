# Optional design sources and tools

The harness's own brand and UI rules remain the shared contract. Upstream skills and tools are optional collaborators, not required runtime dependencies. Discover them through the current agent's available-skill/tool inventory; do not assume a slash command, MCP server, path or browser exists.

| Source | Useful for | Handoff rule |
|---|---|---|
| Taste (`design-taste-frontend`) | Exploring distinct art directions, sourcing credited imagery and inspecting responsive screenshots | Keep the project's existing palette/type unless a redesign was requested. Treat its direction as an input, then apply project tokens and accessibility requirements. |
| Impeccable | Critiquing and refining hierarchy, layout, typography and visual quality | Use its critique/refinement capability when installed. Preserve the project's product brief, design record and tokens. |
| Emil Kowalski skills | Motion decisions, animation review/performance and finding justified animation opportunities | Use only for interaction/motion work; honor the project's reduced-motion and token rules. |
| Figma MCP | Reading the relevant frame, component, variable or design annotation | Use as design evidence when a connected Figma tool is available. Do not claim access when it is absent; reconcile the source with the implemented brand tokens. |
| Browser or screenshot tool | Inspecting rendered layout, responsive behavior and visible states | Use the available browser capability. When none is available, report that visual inspection was not run. |

Do not copy upstream skill text or bundle their files into this skill. If the user wants an external skill installed, use its official installation and license instructions separately. When sources disagree, the approved project brand and explicit product decisions take precedence; accessibility constraints still apply.

## Source notes

- [Taste Skill](https://www.tasteskill.dev/) is MIT licensed and documents a shared-skill install for multiple agent runtimes. Its current browser inspector requires a local Chromium-family browser and Node runtime; check its current docs before installing or invoking it.
- [Impeccable](https://impeccable.style/) provides a design vocabulary and optional integrations for multiple coding agents.
- [Emil Kowalski's AI Skills for Design Engineers](https://emilkowal.ski/skill) includes animation-specific skills and interface-design guidance; the repository lists an MIT license.
- rsc-harness's [`design`](https://github.com/ericrisco/rsc-harness/tree/main/skills/design) is a useful example of a visual workflow that credits and combines upstream sources. This harness uses its own instructions and does not vendor that implementation.
