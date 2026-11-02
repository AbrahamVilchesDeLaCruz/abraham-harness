---
name: api-bc-review
description: "Trigger: Al auditar un BC existente, dividir agregados en submódulos, o evaluar si un concepto merece BC propio. Proceso de revisión y refactor de bounded contexts en apps/api/: límites DDD, submódulos, alineación con skills y checklist de deuda."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.1"
---

## Activation Contract

- Al auditar un bounded context existente (como hicimos con `achievement`)
- Antes de crear un BC nuevo — decidir si es BC propio, submódulo de otro, o shared
- Cuando un BC crece y mezcla varios agregados sin límites claros
- Tras un rediseño de dominio (catálogo dinámico, nuevos eventos, backoffice)

## Hard Rules

- **No sustituye** las skills de capa (`api-domain`, `api-application`, etc.) — las **orquesta** en orden.
- Usa el checklist de `assets/audit-checklist.md` durante la auditoría.
- Cargar la skill indicada antes de corregir cada fila de las tablas de Fase 3 y Fase 7.
- **Prohibido:** capas sueltas (`domain/`, `application/`) en la raíz del BC cuando hay submódulos.
- **Prohibido** en clases/archivos de dominio y application: `Service`, `Dto` en application y `.response.ts` por controller (alternativas en Fase 4).

## Decision Gates

Fase 1 — ¿Merece bounded context propio? Responder en lenguaje de negocio:

| Pregunta | Si sí → |
|----------|---------|
| ¿Tiene lenguaje ubicuo propio distinto de User/Identity? | BC separado |
| ¿Su ciclo de vida evoluciona independiente (catálogo, reglas, desbloqueos)? | BC separado |
| ¿Solo se muestra en perfil/UI de otro módulo? | **No** implica submódulo — es presentación |
| ¿Es proyección de eventos de otros BCs (como Ranking)? | BC consumer/proyector válido |
| ¿Referencia `userId` sin ser propiedad del agregado User? | Referencia por ID, no mover a Identity |

**Regla:** si añadir una feature nueva solo toca el BC dueño (+ emisor del evento), el límite está bien.

## Execution Steps

Detalle de las Fases 2, 3, 4, 6 y 7 en `references/review-phases.md`.

1. Fase 1: aplica la tabla de Decision Gates.
2. Fase 2: si el BC tiene **múltiples agregados cohesivos**, dividir en submódulos.
3. Fase 3: audita la alineación por capa con su tabla.
4. Fase 4: verifica los sufijos permitidos.
5. Fase 5 — Orden de refactor recomendado:
   1. **Límites y submódulos** — estructura de carpetas + `shared/infrastructure/framework/{bc}.module.ts`
   2. **Dominio** — aggregates, VOs, eventos desde aggregate
   3. **Application** — use cases, extraer lógica de subscribers
   4. **Infrastructure** — repos, controllers con envelope, **entity + migration en `typeorm-data-source-options.ts`**
   5. **Tests unitarios** — migrar paths, Object Mothers, policies/strategies de dominio
   6. **Operabilidad y contrato** — logger, Swagger, docs (ver Fase 7)
   7. **E2E API** — al menos un `*.e2e-spec.ts` por endpoint HTTP del BC
   8. **Cliente** — `ApiEnvelope<T>` + i18n si el copy vive en frontend
6. Fase 6: detecta fuente de verdad duplicada, decide **una** fuente y documenta en ADR si es decisiÃ³n de producto.
7. Fase 7: audita operabilidad, contrato y documentación **después** de límites y capas DDD.

## Output Contract

### Commits sugeridos por responsabilidad

Separar en work units reviewables — un commit por área:

```
feat({bc}): log {evento} in {DomainService}
feat({bc}): document GET /{recurso} in OpenAPI
docs({bc}): sync spec, bounded-contexts and rabbitmq design
test({bc}): add catalog/domain parity tests
test({bc}): add GET /{recurso} e2e coverage
test({bc}): add domain object mothers
feat(client): type {recurso} API response with ApiEnvelope
```

## References

- [`references/review-phases.md`](references/review-phases.md) — Fases 2, 3, 4, 6 y 7, señales de lag documental y anti-patterns.
- [`assets/audit-checklist.md`](assets/audit-checklist.md) — checklist de auditoría.
- [`references/docs.md`](references/docs.md) — referencias DDD y skills relacionadas.
- `apps/api/AGENTS.md` — submódulos DDD
