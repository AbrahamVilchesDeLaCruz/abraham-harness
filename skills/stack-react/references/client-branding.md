# client-branding with React

The concept skill `client-branding` defines the rules. This file maps them to this stack.

- Import `src/styles/brand.css` once, in the app's entry file, before any other stylesheet.
- Expose the tokens to TailwindCSS with its theme configuration, so utilities such as `bg-primary` and `text-muted` read the custom properties. Do not copy a value into the Tailwind configuration; reference `var(--color-primary)`.
- Components use those utilities or `var(--token)`. A hex value, a pixel size outside the scale, or an arbitrary-value class is a defect.
- Switch the theme by setting `data-theme` on the `html` element from a hook in `core/`, and store the choice in the client store.
- Load fonts in `index.html` or with an import in `brand.css`, with `font-display: swap` and the fallback stack from the token.
