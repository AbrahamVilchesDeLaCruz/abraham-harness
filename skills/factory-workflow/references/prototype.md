# Navigable frontend prototype

Create this only after the user chooses prototype review in `discovery.md`. It is a design decision artifact, never production code or a substitute for the project's client architecture.

1. Read the project's brand brief, tokens, relevant screens, components, content, and UX references. Preserve fixed brand choices. If brand evidence is incomplete, record provisional assumptions and ask only for a consequential missing decision. Do not write production tokens merely to render a prototype.
2. Create `.agents/plans/{YYYY_MM_DD}-{name}/prototype/index.html`, with local assets in that directory when needed. Make it openable as a local file without a build or external service. Use semantic HTML, accessible controls, and only the small amount of script needed for navigation or meaningful interactions. Do not depend on a framework or invent production pod structure inside the prototype.
3. Show representative content, the main journey, relevant loading/empty/error/success states, and responsive composition. Make links and controls navigable. State which interactions are simulated.
4. Open the prototype and inspect narrow and wide layouts, keyboard navigation, and the main flow with available browser tools. If no visual tool exists, report the unverified checks rather than claiming inspection.
5. Give the user the HTML entry point and a concise explanation of the direction. Incorporate requested changes, then record the selected composition, behavior, brand decisions, and unresolved questions in the discovery handoff. Continue to specification once the user selects the direction; do not treat silence as approval.

The spec writer describes the accepted user experience and constraints. The builder implements it through the project's client skills and stack architecture; do not copy prototype markup, styling, or simulated data into production by default. The final UI still passes the normal critique loop and relevant reviews.
