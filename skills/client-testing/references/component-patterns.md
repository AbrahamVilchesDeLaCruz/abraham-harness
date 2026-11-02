# Client Component Test Patterns — Reference

The stack reference for tests holds the original code of the hook and Component tests.

## Unit test — Mapper (pure function)

```typescript
// products.mapper.test.ts
import { mapProduct } from '../products.mapper';

describe('mapProduct', () => {
  it('transforms snake_case to camelCase', () => {
    const raw = {
      id: 'abc',
      name: 'Desk lamp',
      description: 'Adjustable LED lamp',
      size: 'small' as const,
      restocked_at: '2026-05-21T10:00:00.000Z',
      created_at: '2026-01-01T00:00:00.000Z',
    };

    const result = mapProduct(raw);

    expect(result.name).toBe('Desk lamp');
    expect(result.description).toBe('Adjustable LED lamp');
    expect(result.nextReviewAt).toBeInstanceOf(Date);
  });
});
```

## Unit test — Pod hook

Framework-free shape: run the hook through the stack's hook harness, and apply state changes through it.

- `useProductFilters` initializes with default values: `size` is null and `showFeaturedOnly` is false.
- `setSize` updates the state: after `handlers.setSize('large')`, `size` is `'large'`.
- `resetFilters` returns to the default values: after `handlers.setSize('small')` and `handlers.resetFilters()`, `size` is null.

## Integration test — Component with a view renderer

Framework-free shape: render `ProductsComponent` with default props `products: ProductMother.list(3)`, `isLoading: false`, `isError: false`, and mocked `onDelete` and `onPageChange`.

- Renders the list of products: 3 elements with role `article`.
- Shows a spinner when `isLoading` is true: an element with role `progressbar` is present.
- Calls `onDelete` when the deletion is confirmed: click the first `delete` button and then the `confirm` button, and `onDelete` receives `defaultProps.products[0].id`.

## Object Mother for client tests

```typescript
// __tests__/ProductMother.ts
import { ProductVM } from '../products.types';

export class ProductMother {
  static one(overrides?: Partial<ProductVM>): ProductVM {
    return {
      id: 'test-id-1',
      name: 'What is your return policy?',
      description: 'Returns are accepted within 30 days.',
      size: 'medium',
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
