import { ListWalletsUseCase } from './list-wallets.usecase';
import { CreateWalletUseCase } from './create-wallet.usecase';
import { DeleteWalletUseCase } from './delete-wallet.usecase';
import { InMemoryWalletRepository } from '@/features/wallet/infra/persistence/in-memory-wallet.repository';
import { FinancialIndicatorGateway } from '@/features/wallet/domain/ports/financial-indicator.gateway.port';

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
