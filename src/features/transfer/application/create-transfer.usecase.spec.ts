import { CreateTransferUseCase } from './create-transfer.usecase';
import { InMemoryTransferRepository } from '@/features/transfer/infra/persistence/in-memory-transfer.repository';
import { WalletGateway } from '@/features/transfer/domain/ports/wallet.gateway.port';
import { PaymentMethodGateway } from '@/features/transfer/domain/ports/payment-method.gateway.port';
import { TransferWalletSnapshot } from '@/features/transfer/domain/transfer-wallet-snapshot';
import { BalanceWarning } from '@/shared/kernel/value-objects/balance-warnings';
import {
  BusinessRuleViolationError,
  EntityNotFoundError,
  ValidationError,
} from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

function makeIds() {
  let counter = 0;
  return () => `id-${++counter}`;
}

const now = () => '2026-06-17T10:00:00.000Z';

function snapshot(
  overrides: {
    balance?: number;
    overdraftLimit?: number;
    overdraftSince?: string | null;
  } = {},
): TransferWalletSnapshot {
  const limit = overrides.overdraftLimit ?? 0;
  const since =
    overrides.overdraftSince === undefined ? null : overrides.overdraftSince;
  return TransferWalletSnapshot.fromRaw({
    userId: 'u1',
    name: 'W',
    balance: overrides.balance ?? 0,
    overdraft:
      limit > 0 || since !== null
        ? { limit, monthlyRate: 0.08, graceDays: 0, since }
        : null,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: null,
    deletedAt: null,
  });
}

function walletGatewayWith(
  byId: Record<string, TransferWalletSnapshot | null>,
): WalletGateway {
  return {
    findActiveById: async (walletId: string) => byId[walletId] ?? null,
  };
}

const activePaymentMethod: PaymentMethodGateway = {
  findActiveByEnum: async () => ({ isActive: true }),
};

function makeUseCase(
  repository: InMemoryTransferRepository,
  walletGateway: WalletGateway,
  paymentMethodGateway: PaymentMethodGateway = activePaymentMethod,
) {
  return CreateTransferUseCase.create(
    repository,
    walletGateway,
    paymentMethodGateway,
    makeIds(),
    now,
  );
}

function validInput(
  overrides: Partial<{
    fromWalletId: string;
    toWalletId: string;
    amount: number;
    paymentMethodDescriptionEnum: string;
    transferDate: string;
  }> = {},
) {
  return {
    userId: 'u1',
    fromWalletId: 'w1',
    toWalletId: 'w2',
    amount: 100,
    paymentMethodDescriptionEnum: 'PIX',
    ...overrides,
  };
}

describe('CreateTransferUseCase', () => {
  it('transfere debitando a origem e creditando o destino (neutro: soma conservada)', async () => {
    const repository = new InMemoryTransferRepository();
    const gateway = walletGatewayWith({
      w1: snapshot({ balance: 300 }),
      w2: snapshot({ balance: 50 }),
    });
    const useCase = makeUseCase(repository, gateway);

    const before = 300 + 50;
    const result = await useCase.execute(validInput({ amount: 120 }));

    expect(result.fromWallet.balance).toBe(180);
    expect(result.toWallet.balance).toBe(170);
    expect(result.fromWallet.balance + result.toWallet.balance).toBe(before);
    expect(result.warnings).toEqual([]);
    expect(result.transfer.amount).toBe(120);
  });

  it('grava 2 carteiras + 2 movimentos (DEBIT/CREDIT, refType TRANSFER) + 1 transferência', async () => {
    const repository = new InMemoryTransferRepository();
    const gateway = walletGatewayWith({
      w1: snapshot({ balance: 300 }),
      w2: snapshot({ balance: 0 }),
    });
    const useCase = makeUseCase(repository, gateway);

    await useCase.execute(validInput({ amount: 100 }));

    expect(repository.savedWallets).toHaveLength(2);
    expect(repository.savedMovements).toHaveLength(2);
    const debit = repository.savedMovements.find(
      (m) => m.direction === 'DEBIT',
    );
    const credit = repository.savedMovements.find(
      (m) => m.direction === 'CREDIT',
    );
    expect(debit?.walletId).toBe('w1');
    expect(debit?.refType).toBe('TRANSFER');
    expect(credit?.walletId).toBe('w2');
    expect(debit?.refId).toBe(credit?.refId);
  });

  it('rejeita origem igual ao destino com 400 (ValidationError)', async () => {
    const repository = new InMemoryTransferRepository();
    const useCase = makeUseCase(repository, walletGatewayWith({}));

    await expect(
      useCase.execute(validInput({ toWalletId: 'w1' })),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('rejeita valor não positivo com 400 (ValidationError)', async () => {
    const repository = new InMemoryTransferRepository();
    const useCase = makeUseCase(repository, walletGatewayWith({}));

    await expect(
      useCase.execute(validInput({ amount: 0 })),
    ).rejects.toBeInstanceOf(ValidationError);
    await expect(
      useCase.execute(validInput({ amount: -5 })),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('rejeita data futura com 400 (ValidationError)', async () => {
    const repository = new InMemoryTransferRepository();
    const useCase = makeUseCase(repository, walletGatewayWith({}));

    await expect(
      useCase.execute(validInput({ transferDate: '2026-06-18' })),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('404 quando uma carteira não pertence ao usuário / está deletada / não existe', async () => {
    const repository = new InMemoryTransferRepository();
    const gateway = walletGatewayWith({
      w1: snapshot({ balance: 100 }),
      w2: null,
    });
    const useCase = makeUseCase(repository, gateway);

    await expect(useCase.execute(validInput())).rejects.toMatchObject({
      code: ErrorCode.WALLET_NOT_FOUND,
    });
    await expect(useCase.execute(validInput())).rejects.toBeInstanceOf(
      EntityNotFoundError,
    );
  });

  it('422 quando a forma de pagamento está inativa / inexistente', async () => {
    const repository = new InMemoryTransferRepository();
    const gateway = walletGatewayWith({
      w1: snapshot({ balance: 100 }),
      w2: snapshot({ balance: 0 }),
    });
    const inactive: PaymentMethodGateway = {
      findActiveByEnum: async () => null,
    };
    const useCase = makeUseCase(repository, gateway, inactive);

    await expect(useCase.execute(validInput())).rejects.toBeInstanceOf(
      BusinessRuleViolationError,
    );
  });

  it('origem que fica negativa: sucesso com warning BALANCE_NEGATIVE', async () => {
    const repository = new InMemoryTransferRepository();
    const gateway = walletGatewayWith({
      w1: snapshot({ balance: 50, overdraftLimit: 1000 }),
      w2: snapshot({ balance: 0 }),
    });
    const useCase = makeUseCase(repository, gateway);

    const result = await useCase.execute(validInput({ amount: 80 }));

    expect(result.fromWallet.balance).toBe(-30);
    expect(result.warnings).toContain(BalanceWarning.BALANCE_NEGATIVE);
  });

  it('origem já negativa: sucesso com warning (post-state)', async () => {
    const repository = new InMemoryTransferRepository();
    const gateway = walletGatewayWith({
      w1: snapshot({
        balance: -10,
        overdraftLimit: 1000,
        overdraftSince: '2026-06-01',
      }),
      w2: snapshot({ balance: 0 }),
    });
    const useCase = makeUseCase(repository, gateway);

    const result = await useCase.execute(validInput({ amount: 20 }));

    expect(result.fromWallet.balance).toBe(-30);
    expect(result.warnings).toContain(BalanceWarning.BALANCE_NEGATIVE);
  });

  it('origem caixa pura negativa: BALANCE_NEGATIVE sem OVERDRAFT_LIMIT_EXCEEDED', async () => {
    const repository = new InMemoryTransferRepository();
    const gateway = walletGatewayWith({
      w1: snapshot({ balance: 0 }),
      w2: snapshot({ balance: 0 }),
    });
    const useCase = makeUseCase(repository, gateway);

    const result = await useCase.execute(validInput({ amount: 80 }));

    expect(result.fromWallet.balance).toBe(-80);
    expect(result.warnings).toContain(BalanceWarning.BALANCE_NEGATIVE);
    expect(result.warnings).not.toContain(
      BalanceWarning.OVERDRAFT_LIMIT_EXCEEDED,
    );
  });

  it('estouro do limite emite OVERDRAFT_LIMIT_EXCEEDED', async () => {
    const repository = new InMemoryTransferRepository();
    const gateway = walletGatewayWith({
      w1: snapshot({ balance: 0, overdraftLimit: 50 }),
      w2: snapshot({ balance: 0 }),
    });
    const useCase = makeUseCase(repository, gateway);

    const result = await useCase.execute(validInput({ amount: 80 }));

    expect(result.fromWallet.balance).toBe(-80);
    expect(result.warnings).toContain(BalanceWarning.BALANCE_NEGATIVE);
    expect(result.warnings).toContain(BalanceWarning.OVERDRAFT_LIMIT_EXCEEDED);
  });

  it('transferDate default = hoje quando ausente', async () => {
    const repository = new InMemoryTransferRepository();
    const gateway = walletGatewayWith({
      w1: snapshot({ balance: 100 }),
      w2: snapshot({ balance: 0 }),
    });
    const useCase = makeUseCase(repository, gateway);

    const result = await useCase.execute(validInput());

    expect(result.transfer.transferDate).toBe('2026-06-17');
  });
});
