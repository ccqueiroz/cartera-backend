import { GetWalletByIdUseCase } from './get-wallet-by-id.usecase';
import { CreateWalletUseCase } from './create-wallet.usecase';
import { InMemoryWalletRepository } from '@/features/wallet/infra/persistence/in-memory-wallet.repository';
import { FinancialIndicatorGateway } from '@/features/wallet/domain/ports/financial-indicator.gateway.port';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const gateway: FinancialIndicatorGateway = {
  getActiveIofDailyRate: async () => 0.0038,
};
const now = () => '2026-06-14T10:00:00.000Z';

describe('GetWalletByIdUseCase', () => {
  it('retorna a wallet do dono com campos derivados', async () => {
    const repository = new InMemoryWalletRepository();
    let counter = 0;
    const ids = () => `id-${++counter}`;
    const { wallet } = await CreateWalletUseCase.create(
      repository,
      ids,
      now,
    ).execute({
      userId: 'u1',
      name: 'Nubank',
      hasOverdraft: true,
      overdraftLimit: 100,
    });

    const useCase = GetWalletByIdUseCase.create(repository, gateway, now);
    const result = await useCase.execute({ userId: 'u1', id: wallet.id });

    expect(result.availableBalance).toBe(100);
    expect(result.effectiveBalance).toBe(0);
    expect(result.accruedInterest).toBe(0);
  });

  it('404 (WALLET_NOT_FOUND) para id de outro usuário', async () => {
    const repository = new InMemoryWalletRepository();
    let counter = 0;
    const ids = () => `id-${++counter}`;
    const { wallet } = await CreateWalletUseCase.create(
      repository,
      ids,
      now,
    ).execute({ userId: 'u1', name: 'Nubank' });

    const useCase = GetWalletByIdUseCase.create(repository, gateway, now);
    await expect(
      useCase.execute({ userId: 'outro', id: wallet.id }),
    ).rejects.toMatchObject({ code: ErrorCode.WALLET_NOT_FOUND });
  });
});
