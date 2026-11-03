# client-container-presentational with Testing Library and MSW

The concept skill `client-container-presentational` defines the rules. This file names the tools.

- Component is tested with RTL + props. It is testable with mocked props, with no need for MSW.
- Container is tested with RTL + MSW. Nothing in the pod is mocked: the test crosses the hooks, the repository and the API client.
