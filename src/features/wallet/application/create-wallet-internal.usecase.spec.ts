import {
  CreateWalletInternalUseCase,
  DEFAULT_WALLET_NAME,
} from './create-wallet-internal.usecase';
import { InMemoryWalletRepository } from '@/features/wallet/infra/persistence/in-memory-wallet.repository';

function makeIds() {
  let counter = 0;
  return () => `id-${++counter}`;
}

const now = () => '2026-06-14T10:00:00.000Z';

describe('CreateWalletInternalUseCase', () => {
  it('cria a wallet "Cartera" com saldo 0', async () => {
    const repository = new InMemoryWalletRepository();
    const useCase = CreateWalletInternalUseCase.create(
      repository,
      makeIds(),
      now,
    );

    await useCase.execute({ userId: 'u1' });

    const wallets = await repository.listActiveByUser('u1');
    expect(wallets).toHaveLength(1);
    expect(wallets[0].toOutput().name).toBe(DEFAULT_WALLET_NAME);
    expect(wallets[0].balance.value).toBe(0);
  });

  it('é idempotente por usuário (não duplica)', async () => {
    const repository = new InMemoryWalletRepository();
    const useCase = CreateWalletInternalUseCase.create(
      repository,
      makeIds(),
      now,
    );

    await useCase.execute({ userId: 'u1' });
    await useCase.execute({ userId: 'u1' });

    expect(await repository.listActiveByUser('u1')).toHaveLength(1);
  });
});
