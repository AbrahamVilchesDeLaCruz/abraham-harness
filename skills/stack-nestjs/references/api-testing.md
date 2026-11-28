# api-testing with NestJS

Apply the rules of `api-testing`. This reference shows controller E2E tests with NestJS and supertest. Test subscriber decisions as application units. Verify broker behavior with a focused integration check when messaging risk requires it.

E2E tests live in `test/{bc}/infrastructure/` and use `supertest` with `createTestApp()`. Every test in a file shares one app: create it in `beforeAll` and close it in `afterAll`, never per test. Isolate tests with data cleanup in `afterEach`, not by restarting the app.

```typescript
// apps/api/test/sales/infrastructure/start-order-post.e2e-spec.ts
import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../../shared/infrastructure/create-test-app.js';

describe('sales/order StartOrderPostController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close().catch(() => undefined);
  });

  afterEach(async () => {
    // Delete only the records this suite created
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
