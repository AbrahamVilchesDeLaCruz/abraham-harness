# client-ui-design with React

The concept skill `client-ui-design` defines the rules. This file maps them to this stack.

- Style with TailwindCSS utilities that read the tokens from `brand.css`. Its mobile-first prefixes (`sm:`, `md:`, `lg:`) are the media queries, and its container variants (`@container`, `@md:`) are the container queries.
- State variants map to the states: `hover:`, `focus-visible:`, `active:`, `disabled:`, and `aria-busy` for loading. Never remove the outline without a replacement ring from `--color-focus-ring`.
- Use fluid values with `clamp()` through the token scale, not per-component pixel values.
- Respect motion with the `motion-safe:` and `motion-reduce:` variants. Animate with `transition-transform` and `transition-opacity`, with the duration tokens.
- A loading state lives in the Component as a skeleton sized like the final content. The Container passes `isLoading`, `isError` and `retry` as named fields.
- Use `<img>` with `width`, `height` and `loading="lazy"` for images below the fold, or an `aspect-ratio` wrapper.
- Set `color-scheme` on the root element from the theme, so native controls follow the theme.
