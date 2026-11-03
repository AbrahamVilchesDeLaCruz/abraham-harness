# api-bc-review with Vitest

Apply the process of `api-bc-review`. These are the Vitest forms of its checks.

## Audit checklist

- Phase 7: `beforeEach` resets each mock method explicitly (`mock.method.mockReset()`) and recreates the use case instance.
- Phase 7: `vi.useFakeTimers()` when aggregate depends on `new Date()`.
