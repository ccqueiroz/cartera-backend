import { ListWalletsUseCase } from './list-wallets.usecase';
import { CreateWalletUseCase } from './create-wallet.usecase';
import { DeleteWalletUseCase } from './delete-wallet.usecase';
import { InMemoryWalletRepository } from '@/features/wallet/infra/persistence/in-memory-wallet.repository';
import { FinancialIndicatorGateway } from '@/features/wallet/domain/ports/financial-indicator.gateway.port';
import { Wallet } from '@/features/wallet/domain/wallet.entity';
import { PaginationParams, SortOrder } from '@/shared/query/page';

const gateway: FinancialIndicatorGateway = {
  getActiveIofDailyRate: async () => 0.0038,
};
const now = () => '2026-06-14T10:00:00.000Z';

describe('ListWalletsUseCase', () => {
  it('retorna só ativas do dono, paginadas', async () => {
    const repository = new InMemoryWalletRepository();
    let counter = 0;
    const ids = () => `id-${++counter}`;
    const create = CreateWalletUseCase.create(repository, ids, now);
    await create.execute({ userId: 'u1', name: 'A' });
    const { wallet: b } = await create.execute({ userId: 'u1', name: 'B' });
    await create.execute({ userId: 'outro', name: 'C' });
    await DeleteWalletUseCase.create(repository, now).execute({
      userId: 'u1',
      id: b.id,
    });

    const useCase = ListWalletsUseCase.create(repository, gateway, now);
    const page = await useCase.execute({ userId: 'u1' });

    expect(page.totalElements).toBe(1);
    expect(page.content[0].name).toBe('A');
  });
});

const WALLETS = [
  ['w1', 'Nubank', 300, false, '2026-06-12T09:00:00.000Z'],
  ['w2', 'Caixa', 100, true, '2026-06-10T09:00:00.000Z'],
  ['w3', 'Inter', 200, false, '2026-06-14T09:00:00.000Z'],
] as const;

async function listWith(params: PaginationParams) {
  const repository = new InMemoryWalletRepository();
  for (const [id, name, balance, isDefault, createdAt] of WALLETS)
    await repository.create(
      Wallet.create({ id, userId: 'u1', name, balance, isDefault, createdAt }),
      [],
    );

  const page = await ListWalletsUseCase.create(
    repository,
    gateway,
    now,
  ).execute({ userId: 'u1', params });
  return { ...page, content: page.content.map(({ name }) => name) };
}

describe('[BK2-48] ListWalletsUseCase params', () => {
  it.each([
    ['name', SortOrder.ASC, ['Caixa', 'Inter', 'Nubank']],
    ['balance', SortOrder.DESC, ['Nubank', 'Inter', 'Caixa']],
    ['createdAt', SortOrder.DESC, ['Inter', 'Nubank', 'Caixa']],
  ])(
    'orders by %s %s and returns that ordering',
    async (field, direction, names) => {
      const page = await listWith({ ordering: { [field]: direction } });

      expect(page.content).toEqual(names);
      expect(page.ordering).toEqual({ [field]: direction });
    },
  );

  it.each([
    [{ sort: { field: 'isDefault', value: 'true' } }, ['Caixa']],
    [
      { searchByDate: { field: 'createdAt', exactlyDate: '2026-06-12' } },
      ['Nubank'],
    ],
  ])('keeps only the wallets matching %j', async (params, names) => {
    expect((await listWith(params)).content).toEqual(names);
  });

  it('pages by the params page and size with totalPages and a null ordering', async () => {
    expect(await listWith({ page: 1, size: 2 })).toEqual({
      content: ['Inter'],
      page: 1,
      size: 2,
      totalElements: 3,
      totalPages: 2,
      ordering: null,
    });
  });
});
