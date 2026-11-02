---
name: tdd-workflow
description: "Trigger: Antes de implementar cualquier feature, use case, hook o componente nuevo. Workflow obligatorio de TDD antes de escribir cualquier código nuevo: Red → Green → Refactor. Aplica a api (Jest) y client (Vitest + RTL)."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

Cargar esta skill ANTES de escribir cualquier código nuevo:

- Nuevo use case o domain service (api)
- Nuevo aggregate o value object (api)
- Nuevo hook de pod (client)
- Nuevo Container o Component (client)
- Nuevo mapper, helper o función utilitaria (api o client)

**NO aplica a**: cambios de configuración, migraciones, refactors puros sin nuevo comportamiento.

## Hard Rules

- **El test se escribe antes**. Siempre. No hay excepción.
- **Un test = un comportamiento observable**. No testear implementación interna (`calls repository.match`), sino efecto (`saves the product`).
- **El nombre describe el comportamiento**: `it('throws ProductNotFound when product does not exist')`, no `it('calls repository.match')`.
- **Verificar que el test falla antes de implementar** — un test que nunca falla no prueba nada.
- **Object Mothers siempre** para construir datos de test. Nunca literales inline.
- **No mockear lo que no controlás** — usar abstracciones propias en lugar de mockear `Date` o `Math.random` directamente.
- Esta skill define el **CUÁNDO y EN QUÉ ORDEN** — siempre va primero.

## Decision Gates

Qué testear según la capa:

| Capa | Qué testear | Tool |
|---|---|---|
| Use Case (api) | Flujo completo: happy path + errores de dominio | Jest + jest-mock-extended |
| Domain Service (api) | Comportamiento de negocio aislado | Jest |
| Hook del pod (client) | Estado, handlers, side effects | Vitest + renderHook |
| Mapper (api/client) | Transformación entrada → salida | Jest / Vitest (función pura) |
| Component (client) | Renderizado, interacciones UI | Vitest + RTL |
| Container (client) | Flujo completo con HTTP mockeado | Vitest + RTL + MSW |

**El Domain (aggregates, VOs) no se testea en aislamiento** — se ejercita a través de los tests del Use Case que los invoca.

Otras skills:

| Necesidad | Acción |
|---|---|
| El **CÓMO** crear Mothers, mocks y estructura de `/test` en api | Cargar `api-testing` |
| El **CÓMO** testear hooks, RTL y MSW en client | Cargar `client-testing` |

## Execution Steps

Siempre en este orden:

1. **Entender qué se va a construir.** Antes de escribir ni una línea, responder:
   1. ¿Qué comportamiento nuevo estamos añadiendo? (en lenguaje de negocio, no técnico)
   2. ¿En qué capa vive? (domain, application, infrastructure, client-hook, client-component)
   3. ¿Cuáles son los escenarios happy path y los casos de error?
2. **RED: escribir el test que falla**, antes que la implementación. Ejemplos para api (Jest) y client (Vitest + RTL) en [`references/test-examples.md`](references/test-examples.md). **Verificar que el test falla**: correr el test y confirmar que el error es el esperado (not found, not implemented), no un error de sintaxis o import.
3. **GREEN: mínimo código para pasar el test.** Escribir **solo lo necesario** para que el test pase. Sin optimizar. Sin anticipar casos futuros.
   - Si hay que crear el archivo de implementación, crearlo ahora.
   - Si el test pide un `ProductMother` que no existe, crearlo también.
   - No añadir lógica que el test no exige todavía.
4. **Refactor: limpiar manteniendo verde.** Con el test en verde:
   - Eliminar duplicación
   - Renombrar para claridad
   - Extraer métodos si el método hace más de una cosa
   - **Los tests deben seguir en verde** después de cada cambio
5. **Repetir por cada escenario.** Volver al paso 2 para el siguiente escenario. Un ciclo Red → Green → Refactor por comportamiento.

## References

- [`references/test-examples.md`](references/test-examples.md): ejemplos del test RED.
- Lee [`references/docs.md`](references/docs.md) para skills relacionadas, ADRs y documentación externa.
