---
name: api-auth
description: "Trigger: Al implementar auth, guards, strategies de Passport, decorator @CurrentUser, o voters en apps/api/. Convenciones de autenticación en la API: JWT (access + refresh), OAuth Google, token guest, guards, strategies y CurrentUser."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## Activation Contract

- Al proteger un endpoint con guard
- Al implementar una strategy de Passport (JWT, Google, Guest)
- Al acceder al usuario actual en un controller (`@CurrentUser`)
- Al aplicar permisos de ownership o role

## Hard Rules

- **Access token**: 15min — `Authorization: Bearer` — en memoria del cliente (no `localStorage`)
- **Refresh token**: 30 días — cookie `httpOnly`, `Secure`, `SameSite=Strict`
- **`deviceId`**: generado por el backend — nunca confiado del cliente
- **Guest→registered**: mismo `deviceId` — trazabilidad continua
- Sin guard → endpoint público. Usa `@Public()` para dejar constancia explícita
- Un ownership check que es solo un filtro va en controller con criteria, no en el use case
- La lógica de permisos de negocio no va en el controller

## Decision Gates

| Acceso | Guard |
|---|---|
| Solo usuarios registrados (type: user/staff/admin) | `@UseGuards(JwtAuthGuard)` |
| Solo guests | `@UseGuards(GuestAuthGuard)` |
| Registrado o guest (acepta ambos tokens) | `@UseGuards(AnyAuthGuard)` |
| Admin | `@UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin')` |
| Endpoint público | `@Public()` |

| Tipo de permiso | Dónde | Cómo |
|---|---|---|
| Acceso al endpoint | Controller | `@UseGuards()` |
| Ownership / filtrar mis recursos | Controller | Añade `userId` al criteria |
| Role check simple | Controller | `@UseGuards(RolesGuard)` + `@Roles('admin')` |
| Lógica de negocio con permisos | Use Case | Recibe `UserContext`, decide con reglas de dominio |

## Execution Steps

1. Elige guard y ubicación del permiso con las tablas anteriores.
2. Consulta en `references/strategies.md` el tipo compartido `UserContext`, el uso de `@CurrentUser() user: UserContext` y los ejemplos de ownership y permiso de negocio.
3. Revisa los anti-patterns de `references/strategies.md` antes de terminar.

## References

- [`references/strategies.md`](references/strategies.md) — implementaciones completas de strategies, guards, `@CurrentUser`, flujo guest→registered y estructura de archivos; `UserContext`, uso de guards en controllers, ejemplos de permisos y anti-patterns.
- [`references/docs.md`](references/docs.md) — skills relacionadas, ADRs y documentación externa.
