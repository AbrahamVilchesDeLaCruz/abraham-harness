---
name: api-testing
description: "Trigger: Al crear o modificar tests en apps/api/, al crear Object Mothers, o al mockear puertos. Convenciones de testing en la API: pirámide de tests, Object Mother, estructura de /test, mocks con jest-mock-extended."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## Activation Contract

- Al crear un test de use case o domain service
- Al crear un Object Mother para aggregate, value object o request
- Al mockear un repositorio, publisher u otro puerto
- Al estructurar la carpeta `/test`

## Hard Rules

- La estructura de `/test` replica exactamente la estructura de `/src`
- **Regla**: faker solo vive en `MotherCreator`. Nunca importar faker directamente en un Mother de dominio.
- Los use cases se instancian directamente con `new UseCase(dep1, dep2, ...)` en `beforeEach` — no se usa DI container
- Resetear solo los métodos que el test usa (`.mockReset()`)
- Usar `JestTimers.setup()` / `JestTimers.teardown()` (de `@test/shared/jest-timers`) cuando el aggregate o evento dependen de `new Date()`
- Cada Mother en su propio archivo — nunca inline en el spec
- `random(overrides?)` siempre acepta overrides parciales
- `from(request)` cuando el use case recibe un objeto de request
- Value Object Mothers exponen `invalid()` cuando el test lo necesita
- Un comportamiento por test
- Imports de src usan el alias `@/`; imports de test usan `@test/`
- Sin adaptador concreto en test de aplicación, sin estado compartido entre tests, sin string mágico cuando existe un Mother, sin `jest.fn()` para puertos tipados

## Decision Gates

| Nivel | Qué testea |
|---|---|
| **Unit** | aggregates, value objects, domain services — rápidos, sin I/O |
| **Integration** | use cases con puertos mockeados — nunca adaptadores concretos |
| **E2E** | flujos HTTP completos — solo los caminos críticos |

| Puerto | Estrategia |
|---|---|
| Repository | `mock<ProductRepository>()` |
| DomainEventPublisher | `mock<DomainEventPublisher>()` |
| Domain services / ports | `mock<PortOrService>()` |

## Execution Steps

1. Ubica el test y sus Mothers con `references/test-structure.md`.
2. Compón los Mothers con la jerarquía de `references/test-structure.md`; parte de la plantilla `assets/object-mother.template.md`.
3. Escribe el spec con el patrón canónico de `references/use-case-spec.md`.
4. Revisa los anti-patterns de `references/test-structure.md`.

## References

- [`references/use-case-spec.md`](references/use-case-spec.md) — patrón canónico completo del test de use case, implementaciones completas de Mothers, mocks y nomenclatura de describe.
- [`references/test-structure.md`](references/test-structure.md) — pirámide, estructura de `/test`, jerarquía de Mothers y anti-patterns.
- [`assets/object-mother.template.md`](assets/object-mother.template.md) — plantilla genérica de Object Mother.
- [`references/docs.md`](references/docs.md) — skills relacionadas, ADRs y documentación externa.
