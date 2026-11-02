# api-testing with NestJS

Apply the rules of `api-testing`. This reference shows E2E tests with NestJS and supertest.

E2E tests live in `test/{bc}/infrastructure/` and use `supertest` with `createTestApp()`.

```typescript
// apps/api/test/sales/infrastructure/start-order-post.e2e-spec.ts
import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../../shared/infrastructure/create-test-app';

describe('sales/order StartOrderPostController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createTestApp();
    // DB seed / cleanup if needed
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  it('should return 201 with orderId when valid payload is sent', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ mode: 'standard', itemCount: 10 })
      .expect(201);

    expect(res.body.data.orderId).toBeDefined();
  });
});
```

`createTestApp()` lives in `test/shared/infrastructure/create-test-app.ts` and:
- Starts the real `AppModule` with `Test.createTestingModule`
- Replaces external services (AI, image) with stubs
- Replaces `DomainEventPublisher` with `E2eDomainEventPublisher`
- Applies `ValidationPipe`, `cookieParser` and the global `v1` prefix
