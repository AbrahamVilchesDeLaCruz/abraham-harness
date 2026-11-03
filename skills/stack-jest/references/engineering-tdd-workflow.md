# Jest — tdd-workflow

Applies `tdd-workflow` to API tests with Jest.

## Tool per layer

| Layer | Tool |
|---|---|
| Use Case (api) | Jest + jest-mock-extended |
| Domain Service (api) | Jest |
| Mapper (api) | Jest (pure function) |

## The RED test

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

## Documentation

- [Jest — Getting Started](https://jestjs.io/docs/getting-started) — Jest API
