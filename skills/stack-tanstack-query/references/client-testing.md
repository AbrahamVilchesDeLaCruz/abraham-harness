# client-testing with TanStack Query

The concept skill `client-testing` defines the rules. This file holds its TanStack Query detail.

- Never mock the whole TanStack Query module.
- Container tests render inside a `QueryClientProvider` with a new `QueryClient`. The stack reference for tests shows the full example.

## External Documentation

- [TanStack Query — Testing](https://tanstack.com/query/latest/docs/framework/react/guides/testing) — how to test with `QueryClient`
