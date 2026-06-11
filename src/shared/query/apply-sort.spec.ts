import { applySort, Sortable } from '@/shared/query/apply-sort';

function item(overrides: Partial<Sortable>): Sortable {
  return {
    dueDate: '2026-01-01',
    paymentDate: null,
    amount: 0,
    paidAmount: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('applySort', () => {
  it('ordena pelo campo e direção informados', () => {
    const items = [
      item({ amount: 200 }),
      item({ amount: 100 }),
      item({ amount: 300 }),
    ];
    expect(
      applySort(items, { field: 'amount', direction: 'DESC' }).map(
        (i) => i.amount,
      ),
    ).toEqual([300, 200, 100]);
  });

  it('default é dueDate ASC quando nenhum sort é informado', () => {
    const items = [
      item({ dueDate: '2026-05-10' }),
      item({ dueDate: '2026-02-10' }),
      item({ dueDate: '2026-03-10' }),
    ];
    expect(applySort(items).map((i) => i.dueDate)).toEqual([
      '2026-02-10',
      '2026-03-10',
      '2026-05-10',
    ]);
  });

  it('desempata sempre por createdAt', () => {
    const items = [
      item({ amount: 100, createdAt: '2026-01-03T00:00:00.000Z' }),
      item({ amount: 100, createdAt: '2026-01-01T00:00:00.000Z' }),
      item({ amount: 100, createdAt: '2026-01-02T00:00:00.000Z' }),
    ];
    expect(
      applySort(items, { field: 'amount', direction: 'DESC' }).map(
        (i) => i.createdAt,
      ),
    ).toEqual([
      '2026-01-01T00:00:00.000Z',
      '2026-01-02T00:00:00.000Z',
      '2026-01-03T00:00:00.000Z',
    ]);
  });

  it('é puro: não muta o array de entrada', () => {
    const items = [item({ amount: 2 }), item({ amount: 1 })];
    applySort(items, { field: 'amount', direction: 'ASC' });
    expect(items.map((i) => i.amount)).toEqual([2, 1]);
  });
});
