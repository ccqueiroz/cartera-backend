import {
  ListTransactionsInput,
  ListTransactionsUseCase,
} from '@/features/core-finance/transaction-engine/application/list-transactions.usecase';
import { Transaction } from '@/features/core-finance/transaction-engine/domain/transaction.entity';
import { InMemoryTransactionTreeRepository } from '@/features/core-finance/transaction-engine/infra/persistence/in-memory-transaction-tree.repository';
import { Money } from '@/shared/kernel/value-objects/money.vo';
import { PaginationParams, SortOrder } from '@/shared/query/page';

const userId = 'user-1';
const leaves = [
  ['a', 'BILLS', 30, '2026-06-10', '2026-06-12', 11, 'FOOD', 'PIX'],
  ['b', 'RECEIVABLES', 10, '2026-06-20', '2026-06-05', 25, 'SALARY', 'CASH'],
  ['c', 'BILLS', 20, '2026-07-05', '2026-07-01', 18, 'RENT', 'CASH'],
] as const;

async function list(
  params?: PaginationParams,
  input: Partial<ListTransactionsInput> = {},
) {
  const repository = new InMemoryTransactionTreeRepository();
  await repository.saveMany(
    leaves.map(
      ([
        id,
        type,
        amount,
        dueDate,
        paymentDate,
        paidAmount,
        categoryDescriptionEnum,
        paymentMethodDescriptionEnum,
      ]) =>
        Transaction.create({
          id,
          parentId: null,
          rootId: id,
          userId,
          personId: userId,
          type,
          amount: Money.create(amount),
          dueDate,
          paymentDate,
          paidAmount: Money.create(paidAmount),
          categoryDescriptionEnum,
          paymentMethodDescriptionEnum,
          createdAt: '2026-06-01T00:00:00.000Z',
        }),
    ),
  );
  return ListTransactionsUseCase.create(repository).execute({
    userId,
    scope: 'paid',
    params,
    ...input,
  });
}

const idsOf = (page: { content: { id: string }[] }) =>
  page.content.map(({ id }) => id);

describe('ListTransactionsUseCase', () => {
  it.each([
    ['dueDate', SortOrder.ASC, ['a', 'b', 'c']],
    ['dueDate', SortOrder.DESC, ['c', 'b', 'a']],
    ['paymentDate', SortOrder.ASC, ['b', 'a', 'c']],
    ['paymentDate', SortOrder.DESC, ['c', 'a', 'b']],
    ['amount', SortOrder.ASC, ['b', 'c', 'a']],
    ['amount', SortOrder.DESC, ['a', 'c', 'b']],
    ['paidAmount', SortOrder.ASC, ['a', 'c', 'b']],
    ['paidAmount', SortOrder.DESC, ['b', 'c', 'a']],
  ])(
    'orders by %s %s and returns that ordering',
    async (field, direction, ids) => {
      const ordering = { [field]: direction };
      const page = await list({ ordering });
      expect(idsOf(page)).toEqual(ids);
      expect(page.ordering).toEqual(ordering);
    },
  );

  it.each([
    ['categoryDescriptionEnum', 'RENT', ['c']],
    ['paymentMethodDescriptionEnum', 'CASH', ['b', 'c']],
    ['paymentStatus', 'PAID', ['a', 'c']],
  ])(
    'filters by the sort on %s with a null ordering',
    async (field, value, ids) => {
      const page = await list({ sort: { field, value } });
      expect(idsOf(page)).toEqual(ids);
      expect(page.ordering).toBeNull();
    },
  );

  it('returns an empty page when the sort conflicts with the own filter', async () => {
    const page = await list(
      { sort: { field: 'categoryDescriptionEnum', value: 'RENT' } },
      { categoryDescriptionEnum: 'FOOD' },
    );
    expect(page).toMatchObject({
      content: [],
      totalElements: 0,
      totalPages: 0,
    });
  });

  it.each([
    [{ field: 'dueDate', exactlyDate: '2026-06-20' }, ['b']],
    [
      { field: 'dueDate', initialDate: '2026-06-10', finalDate: '2026-06-20' },
      ['a', 'b'],
    ],
    [{ field: 'paymentDate', exactlyDate: '2026-07-01' }, ['c']],
    [
      {
        field: 'paymentDate',
        initialDate: '2026-06-10',
        finalDate: '2026-07-01',
      },
      ['a', 'c'],
    ],
  ])('filters by the search by date %j', async (searchByDate, ids) => {
    expect(idsOf(await list({ searchByDate }))).toEqual(ids);
  });

  it('intersects the search by date with the fixed dueDate range', async () => {
    const page = await list(
      {
        searchByDate: {
          field: 'dueDate',
          initialDate: '2026-06-01',
          finalDate: '2026-06-30',
        },
      },
      { dueDateFrom: '2026-06-15', dueDateTo: '2026-07-31' },
    );
    expect(idsOf(page)).toEqual(['b']);
  });

  it('counts totalPages over the filtered leaves', async () => {
    const page = await list(
      { sort: { field: 'paymentStatus', value: 'PAID' } },
      { size: 1 },
    );
    expect(page).toMatchObject({
      content: [{ id: 'a' }],
      totalElements: 2,
      totalPages: 2,
    });
  });
});
