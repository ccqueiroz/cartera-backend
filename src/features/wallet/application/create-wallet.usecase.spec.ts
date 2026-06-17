import { CreateWalletUseCase } from './create-wallet.usecase';
import { InMemoryWalletRepository } from '@/features/wallet/infra/persistence/in-memory-wallet.repository';
import { WalletWarning } from '@/features/wallet/domain/wallet-warnings';
import { ValidationError } from '@/shared/kernel/errors/domain.error';

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
    expect(result.wallet.overdraftMonthlyRate).toBe(0.08);
    expect(result.warnings).toEqual([]);
    const statement = await repository.listMovements(result.wallet.id, 'u1');
    expect(statement).toHaveLength(0);
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

  it('config de cheque negativa é rejeitada', async () => {
    const repository = new InMemoryWalletRepository();
    const useCase = CreateWalletUseCase.create(repository, makeIds(), now);

    await expect(
      useCase.execute({ userId: 'u1', name: 'X', overdraftLimit: -1 }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
