import { GetWalletStatementUseCase } from './get-wallet-statement.usecase';
import {
  AdjustBalanceUseCase,
  WalletAdjustOperation,
} from './adjust-balance.usecase';
import { CreateWalletUseCase } from './create-wallet.usecase';
import { InMemoryWalletRepository } from '@/features/wallet/infra/persistence/in-memory-wallet.repository';
import { FinancialIndicatorGateway } from '@/features/wallet/domain/ports/financial-indicator.gateway.port';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { WalletMovement } from '@/features/wallet/domain/wallet-movement.entity';
import { Money } from '@/shared/kernel/value-objects/money.vo';
import { PaginationParams, SortOrder } from '@/shared/query/page';

const gateway: FinancialIndicatorGateway = {
  getActiveIofDailyRate: async () => 0.0038,
};

function makeIds() {
  let counter = 0;
  return () => `id-${++counter}`;
}

describe('GetWalletStatementUseCase', () => {
  it('lists movements by competence, sorted desc', async () => {
    const repository = new InMemoryWalletRepository();
    const ids = makeIds();
    const { wallet } = await CreateWalletUseCase.create(
      repository,
      ids,
      () => '2026-06-01T00:00:00.000Z',
    ).execute({ userId: 'u1', name: 'Nubank' });

    const adjust = AdjustBalanceUseCase.create(
      repository,
      gateway,
      ids,
      () => '2026-06-10T00:00:00.000Z',
    );
    await adjust.execute({
      userId: 'u1',
      id: wallet.id,
      operation: WalletAdjustOperation.DEPOSIT,
      amount: 100,
      occurredAt: '2026-06-10',
    });
    await adjust.execute({
      userId: 'u1',
      id: wallet.id,
      operation: WalletAdjustOperation.WITHDRAW,
      amount: 30,
      occurredAt: '2026-06-12',
    });

    const statement = GetWalletStatementUseCase.create(repository);
    const page = await statement.execute({
      userId: 'u1',
      id: wallet.id,
      month: 6,
      year: 2026,
    });

    expect(page.totalElements).toBe(2);
    expect(page.content[0].occurredAt).toBe('2026-06-12');
  });

  it('period without movement returns empty', async () => {
    const repository = new InMemoryWalletRepository();
    const ids = makeIds();
    const { wallet } = await CreateWalletUseCase.create(
      repository,
      ids,
      () => '2026-06-01T00:00:00.000Z',
    ).execute({ userId: 'u1', name: 'Nubank' });

    const statement = GetWalletStatementUseCase.create(repository);
    const page = await statement.execute({
      userId: 'u1',
      id: wallet.id,
      month: 1,
      year: 2020,
    });

    expect(page.content).toEqual([]);
  });

  it('wallet of another user => 404', async () => {
    const repository = new InMemoryWalletRepository();
    const ids = makeIds();
    const { wallet } = await CreateWalletUseCase.create(
      repository,
      ids,
      () => '2026-06-01T00:00:00.000Z',
    ).execute({ userId: 'u1', name: 'Nubank' });

    const statement = GetWalletStatementUseCase.create(repository);
    await expect(
      statement.execute({ userId: 'outro', id: wallet.id }),
    ).rejects.toMatchObject({ code: ErrorCode.WALLET_NOT_FOUND });
  });
});

const MOVEMENTS = [
  ['m1', 'CREDIT', 100, 'ADJUST', '2026-06-10', '2026-06-10T09:00:00.000Z'],
  ['m2', 'DEBIT', 30, 'TRANSFER', '2026-06-12', '2026-06-12T09:00:00.000Z'],
  ['m3', 'DEBIT', 50, 'SETTLEMENT', '2026-06-05', '2026-06-15T09:00:00.000Z'],
  ['m4', 'CREDIT', 20, 'TRANSFER', '2026-05-20', '2026-05-20T09:00:00.000Z'],
] as const;

async function statementWith(input: {
  month?: number;
  year?: number;
  params?: PaginationParams;
}) {
  const repository = new InMemoryWalletRepository();
  await CreateWalletUseCase.create(
    repository,
    makeIds(),
    () => '2026-06-01T00:00:00.000Z',
  ).execute({ userId: 'u1', name: 'Nubank' });
  const [wallet] = await repository.listActiveByUser('u1');
  await repository.saveWithMovements(
    wallet,
    MOVEMENTS.map(([id, direction, amount, refType, occurredAt, createdAt]) =>
      WalletMovement.create({
        id,
        userId: 'u1',
        walletId: wallet.id,
        direction,
        amount: Money.create(amount),
        refType,
        refId: null,
        occurredAt,
        createdAt,
      }),
    ),
  );

  const page = await GetWalletStatementUseCase.create(repository).execute({
    userId: 'u1',
    id: wallet.id,
    ...input,
  });
  return { ...page, content: page.content.map(({ id }) => id) };
}

describe('[BK2-48] GetWalletStatementUseCase params', () => {
  it.each([
    ['occurredAt', SortOrder.ASC, ['m4', 'm3', 'm1', 'm2']],
    ['amount', SortOrder.DESC, ['m1', 'm3', 'm2', 'm4']],
    ['createdAt', SortOrder.ASC, ['m4', 'm1', 'm2', 'm3']],
  ])(
    'orders by %s %s and returns that ordering',
    async (field, direction, ids) => {
      const page = await statementWith({
        params: { ordering: { [field]: direction } },
      });

      expect(page.content).toEqual(ids);
      expect(page.ordering).toEqual({ [field]: direction });
    },
  );

  it.each([
    ['direction', 'DEBIT', ['m2', 'm3']],
    ['refType', 'TRANSFER', ['m2', 'm4']],
  ])('keeps only the movements whose %s is %s', async (field, value, ids) => {
    const page = await statementWith({ params: { sort: { field, value } } });

    expect(page.content).toEqual(ids);
  });

  it.each([
    [{ field: 'occurredAt', exactlyDate: '2026-06-10' }, ['m1']],
    [
      {
        field: 'createdAt',
        initialDate: '2026-05-20',
        finalDate: '2026-06-10',
      },
      ['m1', 'm4'],
    ],
  ])(
    'keeps only the movements in the date filter %j',
    async (searchByDate, ids) => {
      const page = await statementWith({ params: { searchByDate } });

      expect(page.content).toEqual(ids);
    },
  );

  it('applies the params together with the month and year filter', async () => {
    const page = await statementWith({
      month: 6,
      year: 2026,
      params: { sort: { field: 'refType', value: 'TRANSFER' } },
    });

    expect(page.content).toEqual(['m2']);
  });

  it('pages by the params page and size with totalPages and a null ordering', async () => {
    const page = await statementWith({ params: { page: 1, size: 3 } });

    expect(page).toEqual({
      content: ['m4'],
      page: 1,
      size: 3,
      totalElements: 4,
      totalPages: 2,
      ordering: null,
    });
  });
});
