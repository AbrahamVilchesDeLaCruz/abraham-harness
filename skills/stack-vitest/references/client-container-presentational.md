# client-container-presentational with Testing Library and MSW

The concept skill `client-container-presentational` defines the rules. This file names the tools.

- A presentational Component has no tests of its own; the critical flows exercise it.
- A critical flow runs through the Container with RTL + MSW. Nothing in the pod is mocked: the test crosses the hooks, the repository and the API client.
