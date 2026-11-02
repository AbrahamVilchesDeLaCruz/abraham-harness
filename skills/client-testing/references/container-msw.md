# Container + MSW Test Patterns — Reference

## Integration test — Container con MSW

```tsx
// ProductsContainer.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '../../__mocks__/server';
import { ProductsContainer } from './ProductsContainer';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('ProductsContainer', () => {
  it('carga y muestra products desde la API', async () => {
    server.use(
      http.get('/products', () =>
        HttpResponse.json([
          {
            id: '1',
            front_text: 'Hello',
            back_text: 'Hola',
            difficulty: 'easy',
            next_review_at: '2026-06-01T00:00:00Z',
            created_at: '2026-01-01T00:00:00Z',
          },
        ]),
      ),
    );

    render(<ProductsContainer />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
  });

  it('muestra estado de error cuando la API falla', async () => {
    server.use(
      http.get('/products', () =>
        HttpResponse.json({ message: 'Internal Error' }, { status: 500 }),
      ),
    );

    render(<ProductsContainer />, { wrapper });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
```

## E2E — Playwright

Solo para flujos críticos de usuario (camino feliz + caso de error principal):

```typescript
// e2e/products.spec.ts
import { test, expect } from '@playwright/test';

test('usuario puede crear y revisar una product', async ({ page }) => {
  await page.goto('/products');

  await page.getByRole('button', { name: 'New Product' }).click();
  await page.getByLabel('Front').fill('What is liaison?');
  await page.getByLabel('Back').fill('Linking final consonant to initial vowel');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('What is liaison?')).toBeVisible();
});
```

## Setup MSW en Vitest

```typescript
// src/__mocks__/server.ts
import { setupServer } from 'msw/node';
export const server = setupServer();

// vitest.setup.ts
import { server } from './__mocks__/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Comandos

```bash
pnpm test           # Vitest — unit + integration
pnpm test:e2e       # Playwright — E2E
pnpm test:coverage  # Cobertura
```
