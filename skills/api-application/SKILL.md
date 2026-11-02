---
name: api-application
description: "Trigger: Al crear o modificar casos de uso o domain services en apps/api/. Convenciones de la capa Application en la API: Use Cases y Domain Services."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## Activation Contract

- Al crear un nuevo caso de uso
- Al crear o modificar un domain service
- Al decidir si lógica va en un use case o en un domain service

## Hard Rules

### Use Cases

- Nombre: `{Entidad}{Verbo}` — forma de agente.
- Un caso de uso = una responsabilidad = un método público: `execute()`
- Recibe un `Request*` type — nunca primitivos sueltos, nunca clases DTO
- `Request*` y `Response*` son `type` alias — nunca clases con decoradores
- Retorna primitivos, `Response*`, o `void` — nunca entidades de dominio
- Re-exportar `Request*` y `Response*` en el mismo archivo del use case.
- Crear `response-{entity}-{verb}er.ts` siempre que el use case devuelva más de un campo o el tipo no sea un primitivo simple.
- Los use cases de **write siempre inyectan `DOMAIN_EVENT_PUBLISHER`** — si el aggregate no emite eventos, es un bug en el aggregate, no una razón para omitirlo
- Inyectar `LOGGER_SERVICE` y `APP_METRICS` en todos los use cases que mutan estado
- Usar `toPrimitives()` para serializar la respuesta
- El nombre de la variable inyectada refleja el ROL, no la clase concreta.

### Domain Services

- Nombre: `{Feature}{Action}` — **sin sufijo `Service`**
- Archivo: `{feature}-{action}.ts` — ej: `product-finder.ts`, `guest-order-policy.ts`
- Método con verbo descriptivo: `findOrFail()`, `validate()`, `assertCanX()`
- Puede tener `@Injectable()` cuando necesita repositorios u otros puertos
- Clases estáticas para políticas puras (sin I/O): `GuestOrderPolicy`, `PausedOrderPolicy`

## Decision Gates

Reutilización entre use cases, no I/O vs no-I/O, decide dónde va la lógica:

| Situación | Acción |
| --- | --- |
| **Si la lógica solo la usa un use case** | **→ va en el use case, no se extrae** |
| **Si varios use cases comparten la lógica** | **→ Domain Service en `domain/`** |

### UseCase vs Domain Service

| | Use Case | Domain Service |
| --- | --- | --- |
| **Qué es** | Una transacción de aplicación | Lógica de dominio reutilizada por varios use cases |
| **Método** | `execute()` | verbo descriptivo: `findOrFail()`, `assertCanX()` |
| **Reutilizable** | No — un flujo concreto | Sí — varios UCs lo llaman |
| **Dónde** | `application/{verb}/` | `domain/` |
| **Ejemplo** | `ProductCreator.execute()` | `ProductFinder` (usado por updater, deleter…) |
| **Criterio** | Una sola acción de negocio | Si extraes lógica de 2+ UCs, va aquí |

### Verbos de casos de uso

| Acción | Nombre |
| --- | --- |
| Crear | `ProductCreator` |
| Buscar uno | `ProductFinder` |
| Buscar varios | `ProductSearcher` |
| Actualizar | `ProductUpdater` |
| Eliminar | `ProductDeleter` |
| Iniciar | `OrderStarter` |
| Completar | `OrderCompleter` |

## Execution Steps

1. Decide con los Decision Gates si la lógica va en un use case o en un Domain Service.
2. Al crear un use case, parte del template y nómbralo con la tabla de verbos.
3. Aplica las Hard Rules y contrasta con los anti-patterns de `references/patterns.md`.

## Output Contract

Entrega el use case en `application/{verb}/` con su `Request*` y, si aplica, `Response*` re-exportados en el mismo archivo; o el Domain Service en `domain/`.

## References

- [`references/patterns.md`](references/patterns.md): código de use cases, `Request*`/`Response*`, domain services, inyección y anti-patterns.
- Usa el template de [`assets/use-case.template.md`](assets/use-case.template.md) al crear un nuevo use case.
- Lee [`references/docs.md`](references/docs.md) para ADRs, skills relacionadas y docs externos.
