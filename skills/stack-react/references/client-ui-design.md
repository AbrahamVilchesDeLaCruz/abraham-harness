# client-ui-design with React

The concept skill `client-ui-design` defines the rules. This file maps them to this stack.

- Style with TailwindCSS utilities that read the tokens from `brand.css`. Its mobile-first prefixes (`sm:`, `md:`, `lg:`) are the media queries, and its container variants (`@container`, `@md:`) are the container queries.
- State variants map to the states: `hover:`, `focus-visible:`, `active:`, `disabled:`, and `aria-busy` for loading. Never remove the outline without a replacement ring from `--color-focus-ring`.
- Use fluid values with `clamp()` through the token scale, not per-component pixel values.
- Respect motion with the `motion-safe:` and `motion-reduce:` variants. Animate with `transition-transform` and `transition-opacity`, with the duration tokens.
- A loading state lives in the Component as a skeleton sized like the final content. The Container passes `isLoading`, `isError` and `retry` as named fields.
- Use `<img>` with `width`, `height` and `loading="lazy"` for images below the fold, or an `aspect-ratio` wrapper.
- Set `color-scheme` on the root element from the theme, so native controls follow the theme.
- Use spacing and type classes backed by the project's token scale; do not add arbitrary utility values for one screen. Group related content with smaller scale steps and separate sections with larger steps.
- Prefer layouts that adapt to content and available space. Inspect long labels, dense data, empty states and populated states in the rendered app.
- For visual review, use the project's existing browser workflow or an available browser tool; do not add a new screenshot-test dependency solely to inspect a design.
