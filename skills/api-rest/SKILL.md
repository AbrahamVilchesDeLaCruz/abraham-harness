---
name: api-rest
description: "Trigger: Al diseñar o implementar endpoints en apps/api/. Convenciones RESTful de la API: rutas, métodos HTTP, status codes y acciones DDD con POST."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

- Al diseñar rutas de un nuevo recurso
- Al elegir el método HTTP correcto para una acción
- Al decidir el status code de una respuesta
- Al modelar acciones de dominio que no encajan en CRUD puro

## Hard Rules

- Recursos en `kebab-case` plural: `/products`, `/reviews-sessions`
- Sin verbos en la ruta: nunca `/products/create` ni `/getProduct`
- Anidamiento máximo de 2 niveles: `/collections/:id/products` — si necesitás más, replantear
- IDs siempre en el path, nunca en el body para GET/DELETE
- Las acciones DDD van siempre sobre un recurso existente: `/orders/:id/{acción}`.
- Todo endpoint debe estar documentado con Swagger. Los decoradores se aplican en dos niveles: clase y método.
- Incluir solo los status codes que el endpoint puede devolver realmente — no añadir decoradores genéricos que no apliquen.
- El método de acción siempre se llama `handler`.
- Cada acción HTTP es un controller independiente. Ver skill `api-infrastructure` para naming y payloads.
- Todos los controllers del recurso se registran en el módulo.
- **Request**: validado con `class-validator` + DTO solo en el controller (no pasa a application)
- **Response**: primitivos planos — nunca entidades de dominio
- **snake_case** en JSON de respuesta cuando es convención del equipo — decidir y ser consistente
- El controller extrae y pasa a use case como primitivos — ver skill `api-criteria`.

## Decision Gates

### Status codes

| Situación | Status |
| --- | --- |
| GET exitoso con resultado | `200 OK` |
| GET exitoso sin resultado (lista vacía) | `200 OK` con `[]` |
| POST creación de recurso exitosa | `201 CREATED` |
| PATCH / POST acción DDD exitosa sin body | `204 NO CONTENT` |
| PATCH / POST acción DDD exitosa con body | `200 OK` |
| Recurso no encontrado | `404 NOT FOUND` |
| Validación fallida (campo inválido) | `422 UNPROCESSABLE ENTITY` |
| Conflicto de estado | `409 CONFLICT` |
| No autorizado (sin token) | `401 UNAUTHORIZED` |
| Sin permisos (token válido, acción prohibida) | `403 FORBIDDEN` |

- Las acciones DDD con POST (`/orders/:id/complete`, `/orders/:id/resume`) usan `200 OK` si devuelven body o `204 NO CONTENT` si no. Nunca `201` — ese código es exclusivo de creaciones de recurso.
- `POST /orders` (sin `:id`) es creación de recurso → devuelve `201 CREATED`.

### Cuándo usar acción DDD vs PATCH

Cuando una acción de dominio no es CRUD puro — tiene semántica propia — se modela como sub-recurso con POST.

| Criterio | Usar PATCH | Usar POST /{acción} |
| --- | --- | --- |
| Cambio de datos simples | ✅ | |
| Transición de estado con reglas de negocio | | ✅ |
| La acción tiene nombre en el dominio (`review`, `archive`, `start`) | | ✅ |
| Idempotente | ✅ | depende |

## Execution Steps

1. Define la ruta con las Hard Rules y elige método con los Decision Gates.
2. Asigna status code y decoradores Swagger (ver `references/patterns.md`).
3. Crea un controller por acción y regístralo en el módulo.
4. Contrasta con los anti-patterns de `references/patterns.md`.

## Output Contract

Entrega la ruta, el método, el status code y el controller documentado con Swagger de cada acción.

## References

- [`references/patterns.md`](references/patterns.md): rutas base, acciones DDD, decoradores Swagger por nivel y status, `handler`, controllers, query params y anti-patterns.
- Lee [`references/docs.md`](references/docs.md) para skills relacionadas, ADRs y documentación externa.
