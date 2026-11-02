# tdd-workflow — Ejemplos del test RED

**En api (Jest):**

```typescript
// test/contexts/{context}/application/{verb}/{use-case}.spec.ts
describe('{context}/application/{verb} {ClassName}', () => {
  it('should {comportamiento esperado en lenguaje de negocio}', async () => {
    // Arrange — construir datos con Object Mothers
    const request = RequestProductCreatorMother.random();

    // Act
    await useCase.execute(request);

    // Assert — verificar efecto observable, no implementación interna
    expect(repository.save).toHaveBeenCalledWith(ProductMother.from(request));
  });

  it('should throw {DomainError} when {condición}', async () => {
    await expect(useCase.execute(invalidInput)).rejects.toThrow(SomeDomainError);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
```

**En client (Vitest + RTL):**

```typescript
// src/pods/{pod}/components/__tests__/{Component}.test.tsx
describe('{Component}', () => {
  it('should {comportamiento esperado}', () => {
    render(<Component {...props} />);
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });
});
```
