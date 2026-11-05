# client-ux with React

The concept skill `client-ux` defines the journey and interaction rules. This file maps them to the client architecture.

- Map user steps to views and routes; keep navigation and route transitions in the app shell/router layer.
- Keep server-owned loading, empty, error and success state in the view model passed from the Container to the Component. Give the Component named state and action props rather than hiding flow behavior in styling.
- Keep temporary presentation state local to the owning Component when it has no route, persistence or cross-screen meaning.
- Preserve entered values when a request fails. Let the Container coordinate retry, cancel or navigation with its hooks; render clear recovery choices in the Component.
- Use semantic controls and named fields. `client-accessibility` defines the checks; `client-testing` covers focused interaction tests and critical browser journeys.
- Read `client-container-presentational` and `client-hooks` when a flow changes component boundaries or state ownership.
