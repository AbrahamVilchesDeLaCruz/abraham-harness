# api-auth — Docs & References

## Related Skills

| Skill | Why read it |
|---|---|
| `api-infrastructure` | Controllers that use guards and `CurrentUser` |
| `api-shared` | The shared module where the auth module is registered |
| `api-di` | How to register strategies and guards in the module |
| `api-application` | Use cases that receive `UserContext` as a parameter |

## External Documentation

- [Google OAuth2 — Developers](https://developers.google.com/identity/protocols/oauth2) — scopes, flows

## Token Security Notes

| Token | Storage | Expiry | Transport |
|---|---|---|---|
| Access token | In-memory (client) | 15 min | `Authorization: Bearer` header |
| Refresh token | `httpOnly` cookie | 30 days | Cookie — `Secure`, `SameSite=Strict` |
| Guest token | In-memory (client) | 30 days | `Authorization: Bearer` header |

Never store access tokens in `localStorage` — XSS vectors can read them.

## Internal Docs

| Doc | Relevant content |
|---|---|
| `docs/engineering/engineering-principles.md` | Why the backend generates the `deviceId` (SRP, security) |
