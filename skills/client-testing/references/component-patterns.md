# Client Component Test Patterns — Reference

## Unit test — Mapper (función pura)

```typescript
// products.mapper.test.ts
import { mapProduct } from '../products.mapper';

describe('mapProduct', () => {
  it('transforma snake_case a camelCase', () => {
    const raw = {
      id: 'abc',
      name: 'Desk lamp',
      description: 'Adjustable LED lamp',
      difficulty: 'easy' as const,
      next_review_at: '2026-05-21T10:00:00.000Z',
      created_at: '2026-01-01T00:00:00.000Z',
    };

    const result = mapProduct(raw);

    expect(result.name).toBe('Desk lamp');
    expect(result.description).toBe('Adjustable LED lamp');
    expect(result.nextReviewAt).toBeInstanceOf(Date);
  });
});
```

## Unit test — Hook del pod

```typescript
// hooks/useProductFilters.test.ts
import { renderHook, act } from '@testing-library/react';
import { useProductFilters } from './useProductFilters';

describe('useProductFilters', () => {
  it('inicializa con valores por defecto', () => {
    const { result } = renderHook(() => useProductFilters());
    const [state] = result.current;

    expect(state.difficulty).toBeNull();
    expect(state.showReviewOnly).toBe(false);
  });

  it('setDifficulty actualiza el estado', () => {
    const { result } = renderHook(() => useProductFilters());

    act(() => {
      const [, handlers] = result.current;
      handlers.setDifficulty('hard');
    });

    const [state] = result.current;
    expect(state.difficulty).toBe('hard');
  });

  it('resetFilters vuelve a los valores por defecto', () => {
    const { result } = renderHook(() => useProductFilters());

    act(() => {
      const [, handlers] = result.current;
      handlers.setDifficulty('easy');
      handlers.resetFilters();
    });

    const [state] = result.current;
    expect(state.difficulty).toBeNull();
  });
});
```

## Integration test — Component con RTL

```tsx
// ProductsComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductsComponent } from './ProductsComponent';
import { ProductMother } from './__tests__/ProductMother';

describe('ProductsComponent', () => {
  const defaultProps = {
    products: ProductMother.list(3),
    isLoading: false,
    isError: false,
    onDelete: vi.fn(),
    onPageChange: vi.fn(),
  };

  it('renderiza la lista de products', () => {
    render(<ProductsComponent {...defaultProps} />);
    expect(screen.getAllByRole('article')).toHaveLength(3);
  });

  it('muestra spinner cuando isLoading es true', () => {
    render(<ProductsComponent {...defaultProps} isLoading={true} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('llama onDelete al confirmar eliminación', async () => {
    const onDelete = vi.fn();
    render(<ProductsComponent {...defaultProps} onDelete={onDelete} />);

    fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    expect(onDelete).toHaveBeenCalledWith(defaultProps.products[0].id);
  });
});
```

## Object Mother para tests del cliente

```typescript
// __tests__/ProductMother.ts
import { ProductVM } from '../products.types';

export class ProductMother {
  static one(overrides?: Partial<ProductVM>): ProductVM {
    return {
      id: 'test-id-1',
      name: 'What is your return policy?',
      description: 'Returns are accepted within 30 days.',
      difficulty: 'medium',
      nextReviewAt: new Date('2026-06-01'),
      ...overrides,
    };
  }

  static list(count: number): ProductVM[] {
    return Array.from({ length: count }, (_, i) =>
      ProductMother.one({ id: `test-id-${i + 1}` }),
    );
  }
}
```
