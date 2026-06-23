import { CreateWalletUseCase } from './create-wallet.usecase';
import { InMemoryWalletRepository } from '@/features/wallet/infra/persistence/in-memory-wallet.repository';
import { WalletWarning } from '@/features/wallet/domain/wallet-warnings';
import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

function makeIds() {
  let counter = 0;
  return () => `id-${++counter}`;
}

describe('CreateWalletUseCase', () => {
  const now = () => '2026-06-14T10:00:00.000Z';

  it('cria com defaults e saldo zero sem movimento de abertura', async () => {
    const repository = new InMemoryWalletRepository();
    const useCase = CreateWalletUseCase.create(repository, makeIds(), now);

    const result = await useCase.execute({ userId: 'u1', name: 'Nubank' });

    expect(result.wallet.balance).toBe(0);
    expect(result.wallet.isDefault).toBe(false);
    expect(result.wallet.overdraft).toBeNull();
    expect(result.warnings).toEqual([]);
    const statement = await repository.listMovements(result.wallet.id, 'u1');
    expect(statement).toHaveLength(0);
  });

  it('builds an overdraft policy when hasOverdraft with a positive limit', async () => {
    const repository = new InMemoryWalletRepository();
    const useCase = CreateWalletUseCase.create(repository, makeIds(), now);

    const result = await useCase.execute({
      userId: 'u1',
      name: 'Itaú',
      hasOverdraft: true,
      overdraftLimit: 500,
    });

    expect(result.wallet.overdraft).toEqual({
      limit: 500,
      monthlyRate: 0.08,
      graceDays: 0,
      since: null,
    });
  });

  it('rejects hasOverdraft without a positive limit (OVERDRAFT_LIMIT_REQUIRED)', async () => {
    const repository = new InMemoryWalletRepository();
    const useCase = CreateWalletUseCase.create(repository, makeIds(), now);

    await expect(
      useCase.execute({ userId: 'u1', name: 'X', hasOverdraft: true }),
    ).rejects.toMatchObject({ code: ErrorCode.OVERDRAFT_LIMIT_REQUIRED });
  });

  it('saldo inicial positivo gera movimento de abertura CREDIT', async () => {
    const repository = new InMemoryWalletRepository();
    const useCase = CreateWalletUseCase.create(repository, makeIds(), now);

    const result = await useCase.execute({
      userId: 'u1',
      name: 'Cash',
      balance: 200,
    });

    const movements = await repository.listMovements(result.wallet.id, 'u1');
    expect(movements).toHaveLength(1);
    expect(movements[0].toOutput().direction).toBe('CREDIT');
    expect(movements[0].toOutput().amount).toBe(200);
  });

  it('saldo inicial negativo é permitido com warning BALANCE_NEGATIVE', async () => {
    const repository = new InMemoryWalletRepository();
    const useCase = CreateWalletUseCase.create(repository, makeIds(), now);

    const result = await useCase.execute({
      userId: 'u1',
      name: 'X',
      balance: -50,
    });

    expect(result.wallet.balance).toBe(-50);
    expect(result.warnings).toContain(WalletWarning.BALANCE_NEGATIVE);
  });

  it('negative overdraft config is rejected', async () => {
    const repository = new InMemoryWalletRepository();
    const useCase = CreateWalletUseCase.create(repository, makeIds(), now);

    await expect(
      useCase.execute({
        userId: 'u1',
        name: 'X',
        hasOverdraft: true,
        overdraftLimit: -1,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
