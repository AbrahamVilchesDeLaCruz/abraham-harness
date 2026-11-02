# api-bc-review with Jest

Apply the process of `api-bc-review`. These are the Jest forms of its checks.

## Audit checklist

- Phase 7: `beforeEach` resets each mock method explicitly (`mock.method.mockReset()`) and recreates the use case instance.
- Phase 7: `jest.useFakeTimers()` when aggregate depends on `new Date()`.
