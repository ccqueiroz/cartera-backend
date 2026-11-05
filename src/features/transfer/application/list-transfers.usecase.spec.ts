import { ListTransfersUseCase } from './list-transfers.usecase';
import { Transfer } from '@/features/transfer/domain/transfer.entity';
import {
  ListTransfersFilter,
  TransferRepository,
} from '@/features/transfer/domain/ports/transfer.repository.port';
import { PaginationParams, SortOrder } from '@/shared/query/page';

function transfer(id: string, userId: string, transferDate: string): Transfer {
  return Transfer.with({
    id,
    userId,
    fromWalletId: 'w1',
    toWalletId: 'w2',
    amount: 10,
    paymentMethodDescriptionEnum: 'PIX',
    transferDate,
    createdAt: `${transferDate}T00:00:00.000Z`,
  });
}

function repoWith(transfers: Transfer[]): TransferRepository {
  return {
    saveTransfer: async () => undefined,
    findById: async () => null,
    listByUser: async (userId: string, _filter: ListTransfersFilter) =>
      transfers.filter((t) => t.userId === userId),
  };
}

describe('ListTransfersUseCase', () => {
  it('ordena por transferDate desc e pagina (default 0/20)', async () => {
    const repository = repoWith([
      transfer('a', 'u1', '2026-06-01'),
      transfer('b', 'u1', '2026-06-15'),
      transfer('c', 'u1', '2026-06-10'),
    ]);
    const useCase = ListTransfersUseCase.create(repository);

    const page = await useCase.execute({ userId: 'u1' });

    expect(page.content.map((t) => t.transferDate)).toEqual([
      '2026-06-15',
      '2026-06-10',
      '2026-06-01',
    ]);
    expect(page.page).toBe(0);
    expect(page.size).toBe(20);
    expect(page.totalElements).toBe(3);
  });

  it('filtra por competência month/year', async () => {
    const repository = repoWith([
      transfer('a', 'u1', '2026-06-15'),
      transfer('b', 'u1', '2026-05-15'),
      transfer('c', 'u1', '2025-06-15'),
    ]);
    const useCase = ListTransfersUseCase.create(repository);

    const page = await useCase.execute({ userId: 'u1', month: 6, year: 2026 });

    expect(page.content.map((t) => t.transferDate)).toEqual(['2026-06-15']);
    expect(page.totalElements).toBe(1);
  });

  it('período vazio retorna página vazia', async () => {
    const repository = repoWith([transfer('a', 'u1', '2026-06-15')]);
    const useCase = ListTransfersUseCase.create(repository);

    const page = await useCase.execute({ userId: 'u1', month: 1, year: 2020 });

    expect(page.content).toEqual([]);
    expect(page.totalElements).toBe(0);
  });

  it('respeita page/size custom', async () => {
    const repository = repoWith([
      transfer('a', 'u1', '2026-06-03'),
      transfer('b', 'u1', '2026-06-02'),
      transfer('c', 'u1', '2026-06-01'),
    ]);
    const useCase = ListTransfersUseCase.create(repository);

    const page = await useCase.execute({
      userId: 'u1',
      params: { page: 1, size: 2 },
    });

    expect(page.content.map((t) => t.transferDate)).toEqual(['2026-06-01']);
    expect(page.totalElements).toBe(3);
  });
});

const TRANSFERS = [
  ['t1', 300, 'PIX', '2026-06-10', '2026-06-10T09:00:00.000Z'],
  ['t2', 100, 'BANK_TRANSFER', '2026-06-12', '2026-06-12T09:00:00.000Z'],
  ['t3', 200, 'PIX', '2026-06-05', '2026-06-15T09:00:00.000Z'],
  ['t4', 50, 'BANK_TRANSFER', '2026-05-20', '2026-05-20T09:00:00.000Z'],
] as const;

async function listWith(input: {
  month?: number;
  year?: number;
  params?: PaginationParams;
}) {
  const repository = repoWith(
    TRANSFERS.map(
      ([id, amount, paymentMethodDescriptionEnum, transferDate, createdAt]) =>
        Transfer.with({
          id,
          userId: 'u1',
          fromWalletId: 'w1',
          toWalletId: 'w2',
          amount,
          paymentMethodDescriptionEnum,
          transferDate,
          createdAt,
        }),
    ),
  );

  const page = await ListTransfersUseCase.create(repository).execute({
    userId: 'u1',
    ...input,
  });
  return { ...page, content: page.content.map(({ id }) => id) };
}

describe('[BK2-48] ListTransfersUseCase params', () => {
  it.each([
    ['transferDate', SortOrder.ASC, ['t4', 't3', 't1', 't2']],
    ['amount', SortOrder.DESC, ['t1', 't3', 't2', 't4']],
    ['createdAt', SortOrder.ASC, ['t4', 't1', 't2', 't3']],
  ])(
    'orders by %s %s and returns that ordering',
    async (field, direction, ids) => {
      const page = await listWith({
        params: { ordering: { [field]: direction } },
      });

      expect(page.content).toEqual(ids);
      expect(page.ordering).toEqual({ [field]: direction });
    },
  );

  it.each([
    [
      {
        sort: { field: 'paymentMethodDescriptionEnum', value: 'BANK_TRANSFER' },
      },
      ['t2', 't4'],
    ],
    [
      { searchByDate: { field: 'transferDate', exactlyDate: '2026-06-10' } },
      ['t1'],
    ],
    [
      {
        searchByDate: {
          field: 'createdAt',
          initialDate: '2026-06-12',
          finalDate: '2026-06-15',
        },
      },
      ['t2', 't3'],
    ],
  ])('keeps only the transfers matching %j', async (params, ids) => {
    expect((await listWith({ params })).content).toEqual(ids);
  });

  it('applies the params together with the month and year filter', async () => {
    const page = await listWith({
      month: 6,
      year: 2026,
      params: {
        sort: { field: 'paymentMethodDescriptionEnum', value: 'BANK_TRANSFER' },
      },
    });

    expect(page.content).toEqual(['t2']);
  });
});
