# api-auth with NestJS and Passport

Apply the rules of `api-auth`. This reference shows the NestJS and Passport implementation.

## JWT Strategy

Validates the Bearer access token. Reads the secret via `ConfigService` (never `process.env` directly).

```typescript
// shared/infrastructure/auth/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET')!,
    });
  }

  validate(payload: UserContext): UserContext {
    return payload; // attached to request.user
  }
}
```

## Guest Strategy

Same structure as `JwtStrategy` — it also validates a Bearer JWT, but it is registered under the name `'guest'`. Guest and user tokens share the same secret; the payload's `type` field tells them apart.

```typescript
// shared/infrastructure/auth/guest.strategy.ts
@Injectable()
export class GuestStrategy extends PassportStrategy(Strategy, 'guest') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET')!,
    });
  }

  validate(payload: UserContext): UserContext {
    return payload; // type: 'guest' — no userId
  }
}
```

## Google Strategy

```typescript
// shared/infrastructure/auth/google.strategy.ts
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: config.get<string>('GOOGLE_CALLBACK_URL')!, // from env, not hardcoded
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): UserContext {
    return {
      type: 'user',           // ← 'user', not 'registered'
      deviceId: crypto.randomUUID(),
      fingerprint: '',        // fingerprint not available in the OAuth callback
      ip: '',
      userId: profile.id,
      email: profile.emails?.[0]?.value,
      roles: ['user'],
    };
  }
}
```

## Guards

```typescript
// shared/infrastructure/auth/jwt.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// shared/infrastructure/auth/guest.guard.ts
@Injectable()
export class GuestAuthGuard extends AuthGuard('guest') {}

// shared/infrastructure/auth/any-auth.guard.ts
// Accepts a registered JWT OR a guest token — NestJS tries both strategies in order
@Injectable()
export class AnyAuthGuard extends AuthGuard(['jwt', 'guest']) {}

// shared/infrastructure/auth/roles.guard.ts — only with JwtAuthGuard
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>('roles', [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!roles) return true;
    const { user } = ctx.switchToHttp().getRequest<{ user: UserContext }>();
    return roles.some(r => user.roles?.includes(r));
  }
}
```

## @Public — decorator for endpoints with no authentication

```typescript
// shared/infrastructure/auth/public.decorator.ts
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = (): ReturnType<typeof SetMetadata> =>
  SetMetadata(IS_PUBLIC_KEY, true);
```

Use it on endpoints that require no token. It records explicitly that the endpoint is public, instead of simply not adding a guard.

## @CurrentUser — parameter decorator

```typescript
// shared/infrastructure/auth/current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserContext => {
    const request = ctx.switchToHttp().getRequest<{ user: UserContext }>();
    return request.user;
  },
);
```

## @Roles — metadata decorator

```typescript
// shared/infrastructure/auth/roles.decorator.ts
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

## Using guards in controllers

| Access | Guard |
|---|---|
| Registered users only (type: user/staff/admin) | `@UseGuards(JwtAuthGuard)` |
| Guests only | `@UseGuards(GuestAuthGuard)` |
| Registered or guest (accepts both tokens) | `@UseGuards(AnyAuthGuard)` |
| Admin | `@UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin')` |
| Public endpoint | `@Public()` |

| Permission type | Where | How |
|---|---|---|
| Endpoint access | Controller | `@UseGuards()` |
| Simple role check | Controller | `@UseGuards(RolesGuard)` + `@Roles('admin')` |

```typescript
@UseGuards(JwtAuthGuard)                          // registered users only (type: user/staff/admin)
@UseGuards(GuestAuthGuard)                        // guests only
@UseGuards(AnyAuthGuard)                          // registered or guest (accepts both tokens)
@UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin')  // admin
// No guard → public endpoint. Use @Public() to record it explicitly
@Public()
```

Access the current user in a controller with `@CurrentUser() user: UserContext`:

```typescript
async handler(
  @CurrentUser() user: UserContext,
): Promise<void> {
  await this.useCase.execute({ userId: user.userId });
}
```

## Ownership in the controller

```typescript
@Get()
@UseGuards(JwtAuthGuard)
async handler(@Query() query: SearchProductsGetQuery, @CurrentUser() user: UserContext) {
  const filters = [
    ...query.filters ?? [],
    { field: 'userId', operator: '=', value: user.userId },
  ];
  return this.searcher.execute(filters);
}
```

## Registration

`AuthModule` is registered in `SharedModule`. See `api-di` for how to register strategies and guards in the module.

## File structure of the auth adapters

```
shared/infrastructure/auth/
├── jwt.strategy.ts
├── jwt.guard.ts
├── guest.strategy.ts
├── guest.guard.ts
├── google.strategy.ts
├── google.guard.ts
├── any-auth.guard.ts
├── roles.guard.ts
├── roles.decorator.ts
├── public.decorator.ts
├── current-user.decorator.ts
└── auth.module.ts

identity/shared/infrastructure/framework/identity.module.ts
```

The concept skill uses neutral wording: the auth module is `AuthModule`, the current-user parameter is `@CurrentUser`, the public marker is `@Public` (`IS_PUBLIC_KEY`, `public.decorator.ts`), and the guest strategy's own name is the Passport strategy name `'guest'`.

## External Documentation

- [NestJS — Authentication](https://docs.nestjs.com/security/authentication) — Passport integration, JWT, Guards
- [NestJS — Authorization](https://docs.nestjs.com/security/authorization) — RBAC, Claims-based
- [Passport.js — Strategies](https://www.passportjs.org/packages/) — jwt, google, local
- [jsonwebtoken — npm](https://www.npmjs.com/package/jsonwebtoken) — JWT sign/verify
