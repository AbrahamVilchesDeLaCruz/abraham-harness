---
name: api-error-handler
description: "Trigger: Al crear domain errors, al registrar excepciones en un módulo, o al configurar el filtro HTTP en apps/api/. Convenciones de manejo de errores HTTP en la API: GlobalExceptionRegistry, filtros por módulo y HttpExceptionFilter."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

- Al crear un nuevo domain error que debe mapearse a un HTTP status
- Al añadir un nuevo módulo con sus propias excepciones
- Al configurar el filtro global de excepciones

## Hard Rules

- **Principio**: cada módulo es responsable de registrar sus propios errores. El mantenimiento va donde vive el código.
- El domain error **nunca** conoce el HTTP status — eso es responsabilidad de infrastructure
- Un `ExceptionRegistry` por módulo, uno por feature, en `infrastructure/framework/` — nunca un registry global con todos los errores
- El registry se inicializa en `onModuleInit()` — garantiza que está listo antes de que lleguen requests
- Usar `exception.constructor.name` como key — funciona aunque el bundle minifique, porque los nombres de clase son explícitos

## Decision Gates

### HTTP status por tipo de error de dominio

| Tipo de error | HTTP Status |
| --- | --- |
| Entidad no encontrada (`NotFound`) | `404 NOT_FOUND` |
| Campo inválido / vacío (`Empty`, `Invalid`) | `422 UNPROCESSABLE_ENTITY` |
| Conflicto de estado (`AlreadyExists`, `InvalidStatus`) | `409 CONFLICT` |
| Acción no permitida (`CannotX`) | `400 BAD_REQUEST` |
| Sin permisos | `403 FORBIDDEN` |
| Credenciales inválidas / token expirado | `401 UNAUTHORIZED` |
| Límite de uso superado (`LimitExceeded`) | `429 TOO_MANY_REQUESTS` |

## Execution Steps

1. Crea el domain error sin HTTP status.
2. Asigna su status con la tabla en el `{feature}-exception-registry.ts` del módulo.
3. Registra el registry como provider en el módulo.
4. Contrasta con los anti-patterns de `references/patterns.md`.

## Output Contract

Entrega el domain error, su entrada en el registry del módulo y el registry como provider del módulo.

## References

- [`references/patterns.md`](references/patterns.md): arquitectura, `GlobalExceptionRegistry`, `HttpExceptionFilter`, registry por módulo y anti-patterns.
- Usa el template de [`assets/exception-registry.template.md`](assets/exception-registry.template.md) al crear el registry de un nuevo BC.
- Lee [`references/docs.md`](references/docs.md) para el formato del error envelope y docs externos.
