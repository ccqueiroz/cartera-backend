import { CreateTransferUseCase } from './create-transfer.usecase';
import { InMemoryTransferRepository } from '@/features/transfer/infra/persistence/in-memory-transfer.repository';
import {
  TransferWallet,
  WalletGateway,
} from '@/features/transfer/domain/ports/wallet.gateway.port';
import { PaymentMethodGateway } from '@/features/transfer/domain/ports/payment-method.gateway.port';
import { TransferMovement } from '@/features/transfer/domain/transfer-movement';
import { AtomicContext, AtomicRunner } from '@/shared/database/atomic-runner';
import { Money } from '@/shared/kernel/value-objects/money.vo';
import { SignedMoney } from '@/shared/kernel/value-objects/signed-money.vo';
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

/** Satisfies the port wallet without importing the wallet feature, which transfer never imports. */
class TestWallet implements TransferWallet {
  public occurredAt?: string;
  public updatedAt?: string;

  constructor(
    public balance: SignedMoney,
    private readonly overdraftLimit: number,
  ) {}

  public debit(amount: Money, occurredAt: string, updatedAt: string): void {
    this.balance = this.balance.subtract(SignedMoney.create(amount.value));
    this.occurredAt = occurredAt;
    this.updatedAt = updatedAt;
  }

  public credit(amount: Money, updatedAt: string): void {
    this.balance = this.balance.add(SignedMoney.create(amount.value));
    this.updatedAt = updatedAt;
  }

  public exceedsOverdraftLimit(): boolean {
    return this.overdraftLimit > 0 && this.balance.value < -this.overdraftLimit;
  }
}

/** The port wallet carries no overdraft episode, so `overdraftSince` changes nothing here. */
function snapshot(
  overrides: {
    balance?: number;
    overdraftLimit?: number;
    overdraftSince?: string | null;
  } = {},
): TestWallet {
  return new TestWallet(
    SignedMoney.create(overrides.balance ?? 0),
    overrides.overdraftLimit ?? 0,
  );
}

interface SavedWallet {
  wallet: TransferWallet;
  movements: TransferMovement[];
}

function walletGatewayWith(
  byId: Record<string, TestWallet | null>,
): WalletGateway & { saved: SavedWallet[] } {
  const saved: SavedWallet[] = [];
  return {
    saved,
    loadWalletTx: async (_ctx, walletId) => byId[walletId] ?? null,
    saveWalletTx: async (_ctx, wallet, movements) => {
      saved.push({ wallet, movements });
    },
  };
}

const fakeRunner = {
  run: async <T>(work: (ctx: AtomicContext) => Promise<T>): Promise<T> =>
    work({ txn: {} } as AtomicContext),
} as AtomicRunner;

const activePaymentMethod: PaymentMethodGateway = {
  findActiveByEnum: async () => ({ isActive: true }),
};

function makeUseCase(
  repository: InMemoryTransferRepository,
  walletGateway: WalletGateway,
  paymentMethodGateway: PaymentMethodGateway = activePaymentMethod,
  atomicRunner: AtomicRunner = fakeRunner,
) {
  return CreateTransferUseCase.create(
    repository,
    walletGateway,
    paymentMethodGateway,
    atomicRunner,
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

  it('writes 2 wallets + 2 movements (DEBIT/CREDIT, refType TRANSFER) + 1 transfer', async () => {
    const repository = new InMemoryTransferRepository();
    const source = snapshot({ balance: 300 });
    const destination = snapshot({ balance: 0 });
    const gateway = walletGatewayWith({ w1: source, w2: destination });
    const useCase = makeUseCase(repository, gateway);

    const result = await useCase.execute(
      validInput({ amount: 100, transferDate: '2026-06-15' }),
    );

    const movement = {
      id: expect.any(String),
      userId: 'u1',
      amount: 100,
      refType: 'TRANSFER',
      refId: result.transfer.id,
      occurredAt: '2026-06-15',
      createdAt: now(),
    };
    expect(gateway.saved).toHaveLength(2);
    expect(gateway.saved).toEqual(
      expect.arrayContaining([
        {
          wallet: source,
          movements: [{ ...movement, walletId: 'w1', direction: 'DEBIT' }],
        },
        {
          wallet: destination,
          movements: [{ ...movement, walletId: 'w2', direction: 'CREDIT' }],
        },
      ]),
    );
    expect(source).toMatchObject({
      occurredAt: '2026-06-15',
      updatedAt: now(),
    });
    expect(destination.updatedAt).toBe(now());
    expect(
      (await repository.listByUser('u1', {})).map((transfer) =>
        transfer.toPersistence(),
      ),
    ).toEqual([
      {
        id: result.transfer.id,
        userId: 'u1',
        fromWalletId: 'w1',
        toWalletId: 'w2',
        amount: 100,
        paymentMethodDescriptionEnum: 'PIX',
        transferDate: '2026-06-15',
        createdAt: now(),
      },
    ]);
  });

  it('rejects a source equal to the destination with 400 (ValidationError)', async () => {
    const repository = new InMemoryTransferRepository();
    const useCase = makeUseCase(repository, walletGatewayWith({}));

    await expect(
      useCase.execute(validInput({ toWalletId: 'w1' })),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('rejects a non-positive amount with 400 (ValidationError)', async () => {
    const repository = new InMemoryTransferRepository();
    const useCase = makeUseCase(repository, walletGatewayWith({}));

    await expect(
      useCase.execute(validInput({ amount: 0 })),
    ).rejects.toBeInstanceOf(ValidationError);
    await expect(
      useCase.execute(validInput({ amount: -5 })),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('rejects a future date with 400 (ValidationError)', async () => {
    const repository = new InMemoryTransferRepository();
    const useCase = makeUseCase(repository, walletGatewayWith({}));

    await expect(
      useCase.execute(validInput({ transferDate: '2026-06-18' })),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('404 when a wallet does not belong to the user / is deleted / does not exist', async () => {
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

  it('422 when the payment method is inactive / missing', async () => {
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

  it('source that goes negative: success with BALANCE_NEGATIVE warning', async () => {
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

  it('source already negative: success with warning (post-state)', async () => {
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

  it('pure cash source negative: BALANCE_NEGATIVE without OVERDRAFT_LIMIT_EXCEEDED', async () => {
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

  it('transferDate defaults to today when missing', async () => {
    const repository = new InMemoryTransferRepository();
    const gateway = walletGatewayWith({
      w1: snapshot({ balance: 100 }),
      w2: snapshot({ balance: 0 }),
    });
    const useCase = makeUseCase(repository, gateway);

    const result = await useCase.execute(validInput());

    expect(result.transfer.transferDate).toBe('2026-06-17');
  });

  it('[CDC-12] 404 when the source wallet is missing, before the payment method is checked', async () => {
    const repository = new InMemoryTransferRepository();
    const gateway = walletGatewayWith({ w1: null, w2: snapshot() });
    const inactive: PaymentMethodGateway = {
      findActiveByEnum: async () => null,
    };

    await expect(
      makeUseCase(repository, gateway, inactive).execute(validInput()),
    ).rejects.toMatchObject({ code: ErrorCode.WALLET_NOT_FOUND });
  });

  it('[CDC-12] loads both wallets, saves both and saves the transfer with the run context and the input owner', async () => {
    const repository = new InMemoryTransferRepository();
    const gateway = walletGatewayWith({
      w1: snapshot({ balance: 300 }),
      w2: snapshot(),
    });
    const ctx = { txn: {} } as AtomicContext;
    const runner = {
      run: async <T>(work: (c: AtomicContext) => Promise<T>): Promise<T> =>
        work(ctx),
    } as AtomicRunner;
    const load = jest.spyOn(gateway, 'loadWalletTx');
    const save = jest.spyOn(gateway, 'saveWalletTx');
    const saveTransfer = jest.spyOn(repository, 'saveTx');

    await makeUseCase(repository, gateway, activePaymentMethod, runner).execute(
      validInput(),
    );

    expect(load).toHaveBeenCalledWith(ctx, 'w1', 'u1');
    expect(load).toHaveBeenCalledWith(ctx, 'w2', 'u1');
    expect(load.mock.calls[0][0]).toBe(ctx);
    expect(load.mock.calls[1][0]).toBe(ctx);
    expect(save.mock.calls[0][0]).toBe(ctx);
    expect(save.mock.calls[1][0]).toBe(ctx);
    expect(saveTransfer.mock.calls[0][0]).toBe(ctx);
  });

  it.each(['w1', 'w2', 'transfer'])(
    '[CDC-12] rejects with the error of the %s save inside the run',
    async (failing) => {
      const repository = new InMemoryTransferRepository();
      const gateway = walletGatewayWith({
        w1: snapshot({ balance: 300 }),
        w2: snapshot(),
      });
      const failure = new Error();
      const handled = Promise.reject(failure);
      handled.catch(() => undefined);
      const saveWallet = gateway.saveWalletTx;
      jest
        .spyOn(gateway, 'saveWalletTx')
        .mockImplementation((ctx, wallet, movements) =>
          movements[0]?.walletId === failing
            ? handled
            : saveWallet(ctx, wallet, movements),
        );
      jest
        .spyOn(repository, 'saveTx')
        .mockImplementation(() =>
          failing === 'transfer' ? handled : Promise.resolve(),
        );

      await expect(
        makeUseCase(repository, gateway).execute(validInput()),
      ).rejects.toBe(failure);
    },
  );
});
