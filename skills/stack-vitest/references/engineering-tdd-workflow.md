# Vitest — tdd-workflow

Applies `tdd-workflow` to client tests with Vitest, Testing Library and MSW.

## Tool per layer

| Layer | Tool |
|---|---|
| Pod hook (client) | Vitest + renderHook |
| Mapper (client) | Vitest (pure function) |
| Component (client) | Vitest + RTL |
| Container (client) | Vitest + RTL + MSW |

`client-testing` covers RTL, `renderHook` and MSW.

## The RED test

```typescript
// src/pods/{pod-name}/components/__tests__/{Component}.test.tsx
describe('{Component}', () => {
  it('should {expected behavior}', () => {
    render(<Component {...props} />);
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });
});
```

## Documentation

- [Vitest — Getting Started](https://vitest.dev/guide/) — Vitest API
