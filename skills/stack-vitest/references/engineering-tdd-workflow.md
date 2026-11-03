# Vitest — tdd-workflow

Applies `tdd-workflow` to API and client tests with Vitest, and to client tests with Testing Library and MSW.

## Tool per layer

| Layer | Tool |
|---|---|
| Use Case (api) | Vitest + vitest-mock-extended |
| Domain Service (api) | Vitest |
| Mapper (api) | Vitest (pure function) |
| Pod hook (client) | Vitest + renderHook |
| Pod repository (client) | Vitest |
| Mapper (client) | Vitest (pure function) |
| Component (client) | Vitest + RTL |
| Container (client) | Vitest + RTL + MSW |

`api-testing` covers Object Mothers and typed mocks. `client-testing` covers RTL, `renderHook` and MSW.

## The RED test

### API

```typescript
// test/{bc}/{module}/application/{action}/{use-case}.spec.ts
describe('{bc}/{module}/application/{action} {ClassName}', () => {
  it('should {expected behavior in business language}', async () => {
    // Arrange — build the data with Object Mothers
    const request = RequestProductCreatorMother.random();

    // Act
    await useCase.execute(request);

    // Assert — verify the observable effect, not the internal implementation
    expect(repository.save).toHaveBeenCalledWith(ProductMother.from(request));
  });

  it('should throw {DomainError} when {condition}', async () => {
    await expect(useCase.execute(invalidInput)).rejects.toThrow(SomeDomainError);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
```

### Client

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
