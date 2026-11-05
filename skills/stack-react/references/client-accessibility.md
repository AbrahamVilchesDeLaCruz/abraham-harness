# client-accessibility with React

The concept skill `client-accessibility` defines the outcomes. Apply these checks to React components and rendered flows without introducing a new accessibility dependency by default.

- Prefer native JSX elements and explicitly associated labels. Give icon-only controls an accessible name; hide decorative SVGs from the accessibility tree.
- Use stable keys and semantic structure; do not use element indices or positive `tabIndex` to manufacture keyboard order.
- For dialogs, menus and other custom composites, preserve focus entry, keyboard navigation, Escape behavior and focus return. Prefer a mature native/platform primitive already used by the project.
- Keep accessible names, role and state synchronized with visual state. Associate hints and validation errors with their control.
- Use the existing lint/test/browser stack for automated checks when configured. Browser-based contrast scans require a rendered page; component renderers alone do not prove contrast or focus behavior.
- Run a manual keyboard walkthrough for changed journeys. Report browser, assistive technology and checks that were unavailable.
