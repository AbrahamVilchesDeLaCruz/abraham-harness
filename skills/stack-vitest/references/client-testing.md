# client-testing with Vitest, Testing Library, MSW and Playwright

The concept skill `client-testing` defines the rules. This file maps its tools: test runner = Vitest, view renderer = RTL (React Testing Library), hook harness = `renderHook` + `act`, HTTP interception = MSW, browser runner = Playwright.

## Rules mapped to the tools

- Mappers and pure hooks with independent decisions → unit tests (Vitest)
- Repository with mapping or error decisions → unit test (Vitest), with `vi.mock` on the pod's HTTP calls
- Server-state hook with state or recovery decisions → unit test (Vitest + `renderHook`), with `vi.mock` on the repository, never `apiClient`
- Unit tests cover only business logic: mappers, repositories, hooks, pure utils. A rule inside a Component moves to a hook or mapper
- No rendering tests per presentational Component
- Critical flow → RTL + MSW through the Container, intercepting real HTTP: the test crosses the hooks, the repository and the API client
- Critical journey needing real integration → Playwright, happy path + material error only; run each selected journey in desktop and phone sizes
- Never mock the whole TanStack Query module — use MSW
- `server.use()` inside the `it` to override the handler per case
- `server.resetHandlers()` in `afterEach`, always
- Client Object Mothers use fixed literals (no faker) — client tests prioritize readability.

Anti-patterns:

```tsx
// ❌ Mocking TanStack Query directly
vi.mock('@tanstack/react-query', () => ({ useQuery: vi.fn() }));

// ❌ E2E test for everything — Playwright is slow and fragile
test('mapper formats the dates', () => { await page.goto(...) }); // unit test

// ❌ Container without MSW — mocking the fetch function
vi.mock('./api/products.api', () => ({ getProducts: vi.fn() }));
vi.mock('./products.repository');
```

## Tools per level

| What | Level | Tool | Pattern in the concept skill |
|---|---|---|---|
| Mappers | Unit | Vitest | `component-patterns.md` |
| Repository | Unit | Vitest | `component-patterns.md` |
| Pod hooks | Unit | Vitest + `renderHook` | `component-patterns.md` |
| Critical flow through a Container | Flow | RTL + MSW | `container-integration.md`, named `references/container-msw.md` before the split |
| Critical journey in the browser | Flow | Playwright | `container-integration.md` |

Test pyramid:

```
         /\
        /Flows\        ← RTL + MSW through the Container, or Playwright — critical flows only
       /──────\
      /  Unit  \       ← Vitest — business logic: hooks, repositories, mappers, pure utils
     /__________\
```

## Unit test — Pod hook

```typescript
// hooks/useProductFilters.test.ts
import { renderHook, act } from '@testing-library/react';
import { useProductFilters } from './useProductFilters';

describe('useProductFilters', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useProductFilters());

    expect(result.current.size).toBeNull();
    expect(result.current.showFeaturedOnly).toBe(false);
  });

  it('setSize updates the state', () => {
    const { result } = renderHook(() => useProductFilters());

    act(() => {
      result.current.setSize('large');
    });

    expect(result.current.size).toBe('large');
  });

  it('resetFilters returns to the default values', () => {
    const { result } = renderHook(() => useProductFilters());

    act(() => {
      result.current.setSize('small');
      result.current.resetFilters();
    });

    expect(result.current.size).toBeNull();
  });
});
```

## Unit test — Repository

```typescript
// __tests__/products.repository.test.ts
import { getProducts } from '../api/products.api';
import { productsRepository } from '../products.repository';

vi.mock('../api/products.api');

describe('productsRepository', () => {
  it('returns ViewModels through the mapper', async () => {
    vi.mocked(getProducts).mockResolvedValue([
      {
        id: '1',
        name: 'Desk lamp',
        description: 'Adjustable LED lamp',
        size: 'small',
        restockedAt: '2026-06-01T00:00:00Z',
        createdAt: '2026-01-01T00:00:00Z',
      },
    ]);

    const [product] = await productsRepository.getAll({ page: 1 });

    expect(product.restockedAt).toBeInstanceOf(Date);
  });
});
```

## Unit test — Server-state hook

```tsx
// __tests__/hooks.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProducts } from '../hooks';
import { productsRepository } from '../products.repository';
import { ProductMother } from './ProductMother';

vi.mock('../products.repository');

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('useProducts', () => {
  it('returns what the repository returns', async () => {
    const products = ProductMother.list(2);
    vi.mocked(productsRepository.getAll).mockResolvedValue(products);

    const { result } = renderHook(() => useProducts({ page: 1 }), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(products));
  });
});
```

## Critical flow — Container with MSW

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
  it('loads and shows products from the API', async () => {
    server.use(
      http.get('/products', () =>
        HttpResponse.json([
          {
            id: '1',
            name: 'Desk lamp',
            description: 'Adjustable LED lamp',
            size: 'small',
            restockedAt: '2026-06-01T00:00:00Z',
            createdAt: '2026-01-01T00:00:00Z',
          },
        ]),
      ),
    );

    render(<ProductsContainer />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Desk lamp')).toBeInTheDocument();
    });
  });

  it('shows the error state when the API fails', async () => {
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

## Critical journey — Playwright

Only for critical user flows (happy path + main error case):

```typescript
// e2e/products.spec.ts
import { test, expect } from '@playwright/test';

test('user can create and review a product', async ({ page }) => {
  await page.goto('/products');

  await page.getByRole('button', { name: 'New Product' }).click();
  await page.getByLabel('Name').fill('Desk lamp');
  await page.getByLabel('Description').fill('Adjustable LED lamp');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Desk lamp')).toBeVisible();
});
```

## Visual and accessibility inspection

For a visual change, a short browser inspection is separate from adding an E2E test. When Playwright and the app's browser setup already exist, open the affected route at narrow, medium and wide viewports, inspect representative states and capture screenshots for review. Do not create brittle pixel snapshots by default; add them only when the project deliberately maintains visual baselines.

When an accessibility scanner is already installed, run it against rendered normal and error states. A passing scan is not a replacement for the keyboard and focus walkthrough in `client-accessibility`. If the browser, route or scanner cannot run, report that check as unavailable rather than passed.

## MSW setup in Vitest

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

Split form of the same setup:

```typescript
// vitest.setup.ts
import { server } from './__mocks__/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

```typescript
// __mocks__/server.ts
import { setupServer } from 'msw/node';
export const server = setupServer();
```

## Commands

```bash
pnpm test           # Vitest — unit tests and critical flows
pnpm test:e2e       # Playwright — E2E
pnpm test:coverage  # Coverage
```

## External Documentation

- [Vitest — Docs](https://vitest.dev/guide/) — test runner for the client
- [React Testing Library — Docs](https://testing-library.com/docs/react-testing-library/intro) — `render`, `screen`, `fireEvent`, `waitFor`
- [RTL — `renderHook`](https://testing-library.com/docs/react-testing-library/api/#renderhook) — state hooks
- [Mock Service Worker (MSW) — Docs](https://mswjs.io/docs/) — fetch/axios interceptor
- [Playwright — Docs](https://playwright.dev/docs/intro) — E2E with a real browser
