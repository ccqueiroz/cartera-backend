import {
  AdjustBalanceUseCase,
  WalletAdjustOperation,
} from './adjust-balance.usecase';
import { CreateWalletUseCase } from './create-wallet.usecase';
import { InMemoryWalletRepository } from '@/features/wallet/infra/persistence/in-memory-wallet.repository';
import { FinancialIndicatorGateway } from '@/features/wallet/domain/ports/financial-indicator.gateway.port';
import { WalletWarning } from '@/features/wallet/domain/wallet-warnings';
import { ValidationError } from '@/shared/kernel/errors/domain.error';

function makeIds() {
  let counter = 0;
  return () => `id-${++counter}`;
}

const gateway: FinancialIndicatorGateway = {
  getActiveIofDailyRate: async () => 0.0038,
};

async function seedWallet(
  repository: InMemoryWalletRepository,
  ids: () => string,
  overrides: { overdraftLimit?: number; overdraftMonthlyRate?: number } = {},
) {
  const create = CreateWalletUseCase.create(
    repository,
    ids,
    () => '2026-06-01T00:00:00.000Z',
  );
  const { wallet } = await create.execute({
    userId: 'u1',
    name: 'Nubank',
    overdraftLimit: overrides.overdraftLimit,
    overdraftMonthlyRate: overrides.overdraftMonthlyRate,
  });
  return wallet.id;
}

describe('AdjustBalanceUseCase', () => {
  it('saque abaixo do saldo executa e retorna BALANCE_NEGATIVE (nunca bloqueia)', async () => {
    const repository = new InMemoryWalletRepository();
    const ids = makeIds();
    const id = await seedWallet(repository, ids);
    const useCase = AdjustBalanceUseCase.create(
      repository,
      gateway,
      ids,
      () => '2026-06-01T12:00:00.000Z',
    );

    const result = await useCase.execute({
      userId: 'u1',
      id,
      operation: WalletAdjustOperation.WITHDRAW,
      amount: 1000,
      occurredAt: '2026-06-01',
    });

    expect(result.wallet.balance).toBe(-1000);
    expect(result.warnings).toContain(WalletWarning.BALANCE_NEGATIVE);
    expect(result.movements[0].direction).toBe('DEBIT');
    expect(result.movements[0].refType).toBe('ADJUST');
  });

  it('saque além do limite retorna OVERDRAFT_LIMIT_EXCEEDED', async () => {
    const repository = new InMemoryWalletRepository();
    const ids = makeIds();
    const id = await seedWallet(repository, ids, { overdraftLimit: 100 });
    const useCase = AdjustBalanceUseCase.create(
      repository,
      gateway,
      ids,
      () => '2026-06-01T12:00:00.000Z',
    );

    const result = await useCase.execute({
      userId: 'u1',
      id,
      operation: WalletAdjustOperation.WITHDRAW,
      amount: 150,
      occurredAt: '2026-06-01',
    });

    expect(result.warnings).toContain(WalletWarning.OVERDRAFT_LIMIT_EXCEEDED);
  });

  it('amount ≤ 0 é rejeitado', async () => {
    const repository = new InMemoryWalletRepository();
    const ids = makeIds();
    const id = await seedWallet(repository, ids);
    const useCase = AdjustBalanceUseCase.create(
      repository,
      gateway,
      ids,
      () => '2026-06-01T12:00:00.000Z',
    );

    await expect(
      useCase.execute({
        userId: 'u1',
        id,
        operation: WalletAdjustOperation.WITHDRAW,
        amount: 0,
        occurredAt: '2026-06-01',
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('depósito capitaliza juros antes do principal e fecha o episódio', async () => {
    const repository = new InMemoryWalletRepository();
    const ids = makeIds();
    const id = await seedWallet(repository, ids, { overdraftMonthlyRate: 0.1 });

    const withdraw = AdjustBalanceUseCase.create(
      repository,
      gateway,
      ids,
      () => '2026-06-01T12:00:00.000Z',
    );
    await withdraw.execute({
      userId: 'u1',
      id,
      operation: WalletAdjustOperation.WITHDRAW,
      amount: 1000,
      occurredAt: '2026-06-01',
    });

    const deposit = AdjustBalanceUseCase.create(
      repository,
      gateway,
      ids,
      () => '2026-06-16T12:00:00.000Z',
    );
    const result = await deposit.execute({
      userId: 'u1',
      id,
      operation: WalletAdjustOperation.DEPOSIT,
      amount: 1200,
      occurredAt: '2026-06-16',
    });

    const interest = result.movements.find(
      (m) => m.refType === 'OVERDRAFT_INTEREST',
    );
    expect(interest).toBeDefined();
    expect(interest?.direction).toBe('DEBIT');
    expect(interest?.amount).toBeCloseTo(112.5, 0);
    expect(result.wallet.balance).toBeCloseTo(87.5, 0);
    expect(result.wallet.overdraftSince).toBeNull();
  });
});
