import { GetWalletStatementUseCase } from './get-wallet-statement.usecase';
import {
  AdjustBalanceUseCase,
  WalletAdjustOperation,
} from './adjust-balance.usecase';
import { CreateWalletUseCase } from './create-wallet.usecase';
import { InMemoryWalletRepository } from '@/features/wallet/infra/persistence/in-memory-wallet.repository';
import { FinancialIndicatorGateway } from '@/features/wallet/domain/ports/financial-indicator.gateway.port';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const gateway: FinancialIndicatorGateway = {
  getActiveIofDailyRate: async () => 0.0038,
};

function makeIds() {
  let counter = 0;
  return () => `id-${++counter}`;
}

describe('GetWalletStatementUseCase', () => {
  it('lista movimentos por competência, ordenados desc', async () => {
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

  it('período sem movimento retorna vazio', async () => {
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

  it('wallet de outro usuário ⇒ 404', async () => {
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
