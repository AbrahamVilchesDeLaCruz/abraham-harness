# Vitest — engineering-principles.md in engineering-conventions

Client tool details for the concepts in `engineering-principles.md` in `engineering-conventions`.

## Integration tests

In the frontend: Container + Component + MSW.

## What to test in each layer

| Layer | What to test | How |
|---|---|---|
| Pod hooks (frontend) | State logic, handlers | Unit: `renderHook` |
| Pod repository (frontend) | ViewModels through the mapper | Unit: `vi.mock` on the HTTP calls |
| Container (frontend) | Full flow with data | Integration: HTTP mocked with MSW |
