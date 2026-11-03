# Container Integration and E2E Test Patterns — Reference

The stack reference for tests holds the original code.

## Integration test — Container with HTTP interception

Framework-free shape: override the handler for `/products` inside each `it`, and render `ProductsContainer` inside the server-state provider. Nothing in the pod is mocked: the test crosses the hooks, the repository and the API client, down to the intercepted HTTP request.

- Loads and shows products from the API: the handler returns a raw API list, and the test waits for `Desk lamp` to appear.
- Shows the error state when the API fails: the handler returns status 500, and the test waits for an element with role `alert`.

## E2E

Only for critical user flows (happy path + main error case). Example: a user can create and review a product. Open `/products`, click `New Product`, fill the fields, click `Save`, and expect the new item to be visible.

## HTTP interception setup

- Create one interception server in `src/__mocks__/server.ts`.
- In the test setup file: start it before all tests with unhandled requests as errors, reset its handlers after each test, and close it after all tests.
