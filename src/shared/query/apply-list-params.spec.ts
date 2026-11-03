import { applyListParams } from '@/shared/query/apply-list-params';
import { SortOrder } from '@/shared/query/page';

describe('applyListParams', () => {
  const items = [
    {
      id: 'a',
      amount: 30,
      isDefault: true,
      direction: 'IN',
      occurredAt: '2026-01-09T23:59:59.000Z',
    },
    {
      id: 'b',
      amount: 10,
      isDefault: false,
      direction: 'OUT',
      occurredAt: '2026-01-10T00:00:00.000Z',
    },
    {
      id: 'c',
      amount: 30,
      isDefault: false,
      direction: 'IN',
      occurredAt: null,
    },
    {
      id: 'd',
      amount: 20,
      isDefault: false,
      direction: 'OUT',
      occurredAt: '2026-01-20T23:59:59.000Z',
    },
    {
      id: 'e',
      amount: 40,
      isDefault: false,
      direction: 'IN',
      occurredAt: '2026-01-21T00:00:00.000Z',
    },
  ];

  it('returns the items in input order without params', () => {
    expect(applyListParams(items, {})).toEqual(items);
  });

  it.each([
    { field: 'direction', value: 'IN', ids: ['a', 'c', 'e'] },
    { field: 'isDefault', value: 'true', ids: ['a'] },
  ])(
    'keeps the items whose $field as text equals $value',
    ({ field, value, ids }) => {
      const result = applyListParams(items, { sort: { field, value } });
      expect(result.map((item) => item.id)).toEqual(ids);
    },
  );

  it('keeps the items whose date field falls on the exact day', () => {
    const result = applyListParams(items, {
      searchByDate: { field: 'occurredAt', exactlyDate: '2026-01-20' },
    });
    expect(result.map((item) => item.id)).toEqual(['d']);
  });

  it('keeps the items inside the inclusive interval and leaves out a null date', () => {
    const result = applyListParams(items, {
      searchByDate: {
        field: 'occurredAt',
        initialDate: '2026-01-10',
        finalDate: '2026-01-20',
      },
    });
    expect(result.map((item) => item.id)).toEqual(['b', 'd']);
  });

  it.each([
    ['amount', SortOrder.ASC, ['b', 'd', 'a', 'c', 'e']],
    ['amount', SortOrder.DESC, ['e', 'a', 'c', 'd', 'b']],
    ['direction', SortOrder.ASC, ['a', 'c', 'e', 'b', 'd']],
    ['occurredAt', SortOrder.ASC, ['a', 'b', 'd', 'e', 'c']],
  ])(
    'orders by %s %s, keeping ties in input order and null last',
    (field, direction, ids) => {
      const result = applyListParams(items, {
        ordering: { [field]: direction },
      });
      expect(result.map((item) => item.id)).toEqual(ids);
    },
  );
});
