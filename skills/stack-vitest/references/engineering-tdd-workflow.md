# Vitest — tdd-workflow

Applies `tdd-workflow` to API and client tests with Vitest, and to client tests with Testing Library and MSW.

## Tool per layer

| Layer | Tool |
|---|---|
| Use Case (api) | Vitest + vitest-mock-extended |
| Subscriber (api) | Vitest + vitest-mock-extended, with a domain event from a Mother |
| Controller (api) | Vitest + supertest, E2E through the compose test environment |
| Domain Service (api) | Vitest |
| Mapper (api) | Vitest (pure function) |
| Pod hook (client) | Vitest + renderHook |
| Pod repository (client) | Vitest |
| Mapper (client) | Vitest (pure function) |
| Critical flow (client) | Vitest + RTL + MSW through the Container |

`api-testing` covers Object Mothers and typed mocks. `client-testing` covers `renderHook` and MSW for critical flows.

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
// src/pods/{pod-name}/__tests__/{hook-or-mapper}.test.ts
describe('{hook or mapper}', () => {
  it('should {expected behavior of the business rule}', () => {
    const { result } = renderHook(() => useRule(input));
    expect(result.current.value).toEqual(expected);
  });
});
```

## Documentation

- [Vitest — Getting Started](https://vitest.dev/guide/) — Vitest API
