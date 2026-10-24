# Entity / value object spec

`domain/<feature>.entity.spec.ts`. A `build(overrides)` helper over `create()`, one `it` per invariant and per behavior, `with()` round-trip at the end. Error cases check the catalog code.

```ts
import { Budget } from './budget.entity';
import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

function build(overrides: Partial<Parameters<typeof Budget.create>[0]> = {}) {
  return Budget.create({
    id: 'budget-1',
    userId: 'user-1',
    name: 'Groceries',
    limit: 800,
    createdAt: '2026-10-01T00:00:00.000Z',
    ...overrides,
  });
}

describe('Budget entity', () => {
  it('is born active with the limit normalized to two decimals', () => {
    const output = build({ limit: 800.005 }).toOutput();
    expect(output.active).toBe(true);
    expect(output.limit).toBe(800.01);
  });

  it('rejects an empty name', () => {
    expect(() => build({ name: '   ' })).toThrow(ValidationError);
    expect(() => build({ name: '   ' })).toThrow(
      expect.objectContaining({ code: ErrorCode.BUDGET_NAME_REQUIRED }),
    );
  });

  it('softDelete twice is a business rule violation', () => {
    const budget = build();
    budget.softDelete('2026-10-02T00:00:00.000Z');
    expect(() => budget.softDelete('2026-10-03T00:00:00.000Z')).toThrow(
      expect.objectContaining({ code: ErrorCode.BUDGET_DELETED }),
    );
  });

  it('with() round-trips toPersistence()', () => {
    const persisted = build().toPersistence();
    expect(Budget.with(persisted).toPersistence()).toEqual(persisted);
  });
});
```

For a VO: one `it` per normalization (rounding), per rejected input (negative, NaN) and per operation. Time-dependent logic (`PaymentStatus`) receives `today` as input; never `jest.useFakeTimers` for domain.
