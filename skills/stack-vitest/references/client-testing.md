# client-testing with Vitest, Testing Library, MSW and Playwright

The concept skill `client-testing` defines the rules. This file maps its tools: test runner = Vitest, view renderer = RTL (React Testing Library), hook harness = `renderHook` + `act`, HTTP interception = MSW, browser runner = Playwright.

## Rules mapped to the tools

- Mappers and pure hooks → always unit tests (Vitest)
- Component (presentational) → RTL, mocked props, no queries
- Container → RTL + MSW, intercepting real HTTP
- E2E → Playwright, only critical flows — happy path + main error
- Never mock the whole TanStack Query module — use MSW
- `server.use()` inside the `it` to override the handler per case
- `server.resetHandlers()` in `afterEach`, always
- Client Object Mothers use fixed literals (no faker) — client tests prioritize readability.

Anti-patterns:

```tsx
// ❌ Mocking TanStack Query directly
vi.mock('@tanstack/react-query', () => ({ useQuery: vi.fn() }));

// ❌ E2E test for everything — Playwright is slow and fragile
test('mapper transforms snake_case', () => { await page.goto(...) }); // unit test

// ❌ Container without MSW — mocking the fetch function
vi.mock('../products.api', () => ({ getProducts: vi.fn() }));
```

## Tools per level

| What | Level | Tool | Pattern in the concept skill |
|---|---|---|---|
| Mappers | Unit | Vitest | `component-patterns.md` |
| Pod hooks | Unit | Vitest + `renderHook` | `component-patterns.md` |
| Component (presentational) | Integration | RTL | `component-patterns.md` |
| Container (with queries) | Integration | RTL + MSW | `container-integration.md`, named `references/container-msw.md` before the split |
| Critical end-to-end flow | E2E | Playwright | `container-integration.md` |

Test pyramid:

```
         /\
        /E2E\          ← Playwright — critical user flows
       /──────\
      /Integr. \       ← RTL — Container + Component together with MSW
     /──────────\
    /   Unit     \     ← Vitest — hooks, mappers, pure utils
   /______________\
```

## Unit test — Pod hook

```typescript
// hooks/useProductFilters.test.ts
import { renderHook, act } from '@testing-library/react';
import { useProductFilters } from './useProductFilters';

describe('useProductFilters', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useProductFilters());
    const [state] = result.current;

    expect(state.size).toBeNull();
    expect(state.showFeaturedOnly).toBe(false);
  });

  it('setSize updates the state', () => {
    const { result } = renderHook(() => useProductFilters());

    act(() => {
      const [, handlers] = result.current;
      handlers.setSize('large');
    });

    const [state] = result.current;
    expect(state.size).toBe('large');
  });

  it('resetFilters returns to the default values', () => {
    const { result } = renderHook(() => useProductFilters());

    act(() => {
      const [, handlers] = result.current;
      handlers.setSize('small');
      handlers.resetFilters();
    });

    const [state] = result.current;
    expect(state.size).toBeNull();
  });
});
```

## Integration test — Component with RTL

```tsx
// __tests__/ProductsComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductsComponent } from '../ProductsComponent';
import { ProductMother } from './ProductMother';

describe('ProductsComponent', () => {
  const defaultProps = {
    products: ProductMother.list(3),
    isLoading: false,
    isError: false,
    onDelete: vi.fn(),
    onPageChange: vi.fn(),
  };

  it('renders the list of products', () => {
    render(<ProductsComponent {...defaultProps} />);
    expect(screen.getAllByRole('article')).toHaveLength(3);
  });

  it('shows a spinner when isLoading is true', () => {
    render(<ProductsComponent {...defaultProps} isLoading={true} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('calls onDelete when the deletion is confirmed', async () => {
    const onDelete = vi.fn();
    render(<ProductsComponent {...defaultProps} onDelete={onDelete} />);

    fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    expect(onDelete).toHaveBeenCalledWith(defaultProps.products[0].id);
  });
});
```

## Integration test — Container with MSW

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
            restocked_at: '2026-06-01T00:00:00Z',
            created_at: '2026-01-01T00:00:00Z',
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

## E2E — Playwright

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
pnpm test           # Vitest — unit + integration
pnpm test:e2e       # Playwright — E2E
pnpm test:coverage  # Coverage
```

## External Documentation

- [Vitest — Docs](https://vitest.dev/guide/) — test runner for the client
- [React Testing Library — Docs](https://testing-library.com/docs/react-testing-library/intro) — `render`, `screen`, `fireEvent`, `waitFor`
- [RTL — `renderHook`](https://testing-library.com/docs/react-testing-library/api/#renderhook) — state hooks
- [Mock Service Worker (MSW) — Docs](https://mswjs.io/docs/) — fetch/axios interceptor
- [Playwright — Docs](https://playwright.dev/docs/intro) — E2E with a real browser
