import {
  makeTransactionEngine,
  TransactionEngine,
} from '@/features/core-finance/transaction-engine/transaction-engine.factory';
import { InMemoryTransactionTreeRepository } from '@/features/core-finance/transaction-engine/infra/persistence/in-memory-transaction-tree.repository';
import { CategoryGateway } from '@/features/core-finance/transaction-engine/domain/ports/category.gateway.port';
import { PaymentMethodGateway } from '@/features/core-finance/transaction-engine/domain/ports/payment-method.gateway.port';
import { TransactionTypeEnum } from '@/shared/kernel/enums/transaction-type.enum';
import { AtomicContext, AtomicRunner } from '@/shared/database/atomic-runner';
import { WalletSnapshot } from '@/features/core-finance/shared/domain/wallet-snapshot';
import {
  WalletMovementSpec,
  SettlementMovementRef,
  SettlementWallet,
  WalletGateway,
  WalletTxContext,
} from '@/features/core-finance/shared/ports/wallet.gateway.port';
import { Money } from '@/shared/kernel/value-objects/money.vo';
import { SignedMoney } from '@/shared/kernel/value-objects/signed-money.vo';
import { SettleReceivableUseCase } from '@/features/core-finance/receivables/application/settle-receivable.usecase';
import { ReverseReceivableUseCase } from '@/features/core-finance/receivables/application/reverse-receivable.usecase';
import { GlobalSettleReceivableUseCase } from '@/features/core-finance/receivables/application/global-settle-receivable.usecase';
import { ListUnreceivedByPeriodUseCase } from '@/features/core-finance/receivables/application/list-unreceived-by-period.usecase';
import { CreateSingleReceivableUseCase } from '@/features/core-finance/receivables/application/create-single-receivable.usecase';
import { CreateInstallmentReceivableUseCase } from '@/features/core-finance/receivables/application/create-installment-receivable.usecase';
import { ListReceivablesUseCase } from '@/features/core-finance/receivables/application/list-receivables.usecase';
import { GetReceivableByIdUseCase } from '@/features/core-finance/receivables/application/get-receivable-by-id.usecase';
import { EditReceivableUseCase } from '@/features/core-finance/receivables/application/edit-receivable.usecase';
import { SoftDeleteReceivableUseCase } from '@/features/core-finance/receivables/application/soft-delete-receivable.usecase';

const userId = 'user-1';
/** The movement `createdAt` as the `updatedAt` of the credit. */
const CREDIT_DATES = { updatedAt: '2026-06-05T00:00:00.000Z' };

const categoryGateway: CategoryGateway = { resolve: async () => null };
const paymentMethodGateway: PaymentMethodGateway = {
  isActive: async (e: string) => e === 'PIX',
};

function buildEngine(): TransactionEngine {
  let counter = 0;
  return makeTransactionEngine({
    db: {} as never,
    repository: new InMemoryTransactionTreeRepository(),
    categoryGateway,
    paymentMethodGateway,
    generateId: () => `tx-${++counter}`,
    now: () => '2026-06-01T00:00:00.000Z',
  });
}

const fakeRunner = {
  run: async <T>(work: (ctx: AtomicContext) => Promise<T>): Promise<T> =>
    work({ txn: {} } as AtomicContext),
} as AtomicRunner;

/** Satisfies the port wallet without importing the wallet feature, which core-finance never imports. */
class TestWallet implements SettlementWallet {
  public occurredAt?: string;
  public updatedAt?: string;

  constructor(
    public readonly id: string,
    public balance: SignedMoney,
    private readonly overdraftLimit = 0,
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

  public closeOverdraftEpisode(): void {}

  public exceedsOverdraftLimit(): boolean {
    return this.overdraftLimit > 0 && this.balance.value < -this.overdraftLimit;
  }
}

class FakeWalletGateway implements WalletGateway {
  public readonly movements: WalletMovementSpec[] = [];
  /** The dates the last saved wallet received from its debit or credit. */
  public savedDates: { occurredAt?: string; updatedAt?: string } = {};
  public balance: number;

  constructor(
    private readonly walletId: string,
    initialBalance: number,
    private readonly overdraftLimit = 0,
  ) {
    this.balance = initialBalance;
  }

  public async findActiveSnapshot(
    walletId: string,
  ): Promise<WalletSnapshot | null> {
    if (walletId !== this.walletId) return null;
    return WalletSnapshot.fromRaw(walletId, {
      userId,
      balance: this.balance,
      overdraft:
        this.overdraftLimit > 0
          ? {
              limit: this.overdraftLimit,
              monthlyRate: 0.08,
              graceDays: 0,
              since: null,
            }
          : null,
    });
  }

  public async findSettlementMovement(
    leafId: string,
  ): Promise<SettlementMovementRef | null> {
    const found = this.movements.find(
      (m) => m.refId === leafId && m.refType === 'SETTLEMENT',
    );
    return found ? { walletId: found.walletId, amount: found.amount } : null;
  }

  public async persistSettlement(
    _ctx: AtomicContext,
    snapshot: WalletSnapshot,
    movements: WalletMovementSpec[],
  ): Promise<void> {
    this.balance = snapshot.balance.value;
    this.movements.push(...movements);
  }

  public async loadWalletTx(
    _ctx: WalletTxContext,
    walletId: string,
  ): Promise<SettlementWallet | null> {
    if (walletId !== this.walletId) return null;
    return new TestWallet(
      walletId,
      SignedMoney.create(this.balance),
      this.overdraftLimit,
    );
  }

  public async findLatestSettlementTx(
    _ctx: WalletTxContext,
    leafId: string,
  ): Promise<SettlementMovementRef | null> {
    const latest = this.movements
      .filter((m) => m.refId === leafId && m.refType === 'SETTLEMENT')
      .pop();
    return latest ? { walletId: latest.walletId, amount: latest.amount } : null;
  }

  public async saveWalletTx(
    _ctx: WalletTxContext,
    wallet: SettlementWallet,
    movements: WalletMovementSpec[],
  ): Promise<void> {
    const { occurredAt, updatedAt } = wallet as TestWallet;
    this.savedDates = { occurredAt, updatedAt };
    this.balance = wallet.balance.value;
    this.movements.push(...movements);
  }
}

/** Runs the work twice and drops the wallet writes of the first run, as a Firestore retry does. */
function retryingRunner(wallet: FakeWalletGateway): AtomicRunner {
  return {
    run: async <T>(work: (ctx: AtomicContext) => Promise<T>): Promise<T> => {
      const { balance } = wallet;
      const written = wallet.movements.length;
      await work({ txn: {} } as AtomicContext);
      wallet.balance = balance;
      wallet.movements.splice(written);
      return work({ txn: {} } as AtomicContext);
    },
  } as AtomicRunner;
}

/** Wallet com um SETTLEMENT pré-existente e saldo já drenado, para provar o estorno negativar. */
class SeededReversalWalletGateway implements WalletGateway {
  public readonly movements: WalletMovementSpec[] = [];
  private balance: number;

  constructor(
    private readonly walletId: string,
    initialBalance: number,
    seededLeafId: string,
    seededAmount: number,
  ) {
    this.balance = initialBalance;
    this.movements.push({
      id: 'seed',
      userId,
      walletId,
      direction: 'CREDIT',
      amount: seededAmount,
      refType: 'SETTLEMENT',
      refId: seededLeafId,
      occurredAt: '2026-06-05',
      createdAt: '2026-06-05T00:00:00.000Z',
    });
  }

  public async findActiveSnapshot(
    walletId: string,
  ): Promise<WalletSnapshot | null> {
    if (walletId !== this.walletId) return null;
    return WalletSnapshot.fromRaw(walletId, {
      userId,
      balance: this.balance,
      overdraft: null,
    });
  }

  public async findSettlementMovement(
    leafId: string,
  ): Promise<SettlementMovementRef | null> {
    const found = this.movements.find(
      (m) => m.refId === leafId && m.refType === 'SETTLEMENT',
    );
    return found ? { walletId: found.walletId, amount: found.amount } : null;
  }

  public async persistSettlement(
    _ctx: AtomicContext,
    snapshot: WalletSnapshot,
    movements: WalletMovementSpec[],
  ): Promise<void> {
    this.balance = snapshot.balance.value;
    this.movements.push(...movements);
  }

  public async loadWalletTx(
    _ctx: WalletTxContext,
    walletId: string,
  ): Promise<SettlementWallet | null> {
    if (walletId !== this.walletId) return null;
    return new TestWallet(walletId, SignedMoney.create(this.balance));
  }

  public async findLatestSettlementTx(
    _ctx: WalletTxContext,
    leafId: string,
  ): Promise<SettlementMovementRef | null> {
    const latest = this.movements
      .filter((m) => m.refId === leafId && m.refType === 'SETTLEMENT')
      .pop();
    return latest ? { walletId: latest.walletId, amount: latest.amount } : null;
  }

  public async saveWalletTx(
    _ctx: WalletTxContext,
    wallet: SettlementWallet,
    movements: WalletMovementSpec[],
  ): Promise<void> {
    this.balance = wallet.balance.value;
    this.movements.push(...movements);
  }
}

async function createReceivableLeaf(
  engine: TransactionEngine,
  amount: number,
): Promise<string> {
  const node = await engine.createSingle.execute({
    userId,
    personId: userId,
    type: TransactionTypeEnum.RECEIVABLES,
    amount,
    dueDate: '2026-06-10',
  });
  return node.id;
}

describe('SettleReceivableUseCase', () => {
  it('recebe: folha recebida + wallet creditada + movimento SETTLEMENT + envelope', async () => {
    const engine = buildEngine();
    const wallet = new FakeWalletGateway('w1', 100);
    const settle = SettleReceivableUseCase.create(
      engine,
      wallet,
      fakeRunner,
      () => 'mov-1',
      () => '2026-06-05T00:00:00.000Z',
    );
    const leafId = await createReceivableLeaf(engine, 30);

    const result = await settle.execute({
      id: leafId,
      userId,
      walletId: 'w1',
      paidAmount: 30,
      paymentDate: '2026-06-05',
      paymentMethodDescriptionEnum: 'PIX',
    });

    expect(result.root.paid).toBe(true);
    expect(result.wallet).toEqual({ id: 'w1', balance: 130 });
    expect(result.warnings).toEqual([]);
    expect(wallet.movements).toHaveLength(1);
    expect(wallet.movements[0]).toMatchObject({
      direction: 'CREDIT',
      refType: 'SETTLEMENT',
      refId: leafId,
      amount: 30,
    });
    expect(wallet.savedDates).toEqual(CREDIT_DATES);
  });

  it('missing wallet gives WALLET_NOT_FOUND (writes nothing)', async () => {
    const engine = buildEngine();
    const wallet = new FakeWalletGateway('w1', 100);
    const settle = SettleReceivableUseCase.create(
      engine,
      wallet,
      fakeRunner,
      () => 'mov-1',
      () => '2026-06-05T00:00:00.000Z',
    );
    const leafId = await createReceivableLeaf(engine, 30);

    await expect(
      settle.execute({
        id: leafId,
        userId,
        walletId: 'other',
        paidAmount: 30,
        paymentDate: '2026-06-05',
        paymentMethodDescriptionEnum: 'BOLETO',
      }),
    ).rejects.toMatchObject({ code: 'WALLET_NOT_FOUND' });
    expect(wallet.movements).toHaveLength(0);
  });

  it('[CDC-07] a settlement loads and saves the wallet with the run context and the input owner, and answers with its balance and warnings', async () => {
    const engine = buildEngine();
    const wallet = new FakeWalletGateway('w1', -50, 5);
    const ctx = { txn: {} } as AtomicContext;
    const runner = {
      run: async <T>(work: (c: AtomicContext) => Promise<T>): Promise<T> =>
        work(ctx),
    } as AtomicRunner;
    const load = jest.spyOn(wallet, 'loadWalletTx');
    const save = jest.spyOn(wallet, 'saveWalletTx');
    const settle = SettleReceivableUseCase.create(
      engine,
      wallet,
      runner,
      () => 'mov-1',
      () => '2026-06-05T00:00:00.000Z',
    );
    const leafId = await createReceivableLeaf(engine, 30);

    const result = await settle.execute({
      id: leafId,
      userId,
      walletId: 'w1',
      paidAmount: 30,
      paymentDate: '2026-06-05',
      paymentMethodDescriptionEnum: 'PIX',
    });

    expect(load).toHaveBeenCalledWith(ctx, 'w1', userId);
    expect(load.mock.calls[0][0]).toBe(ctx);
    expect(save.mock.calls[0][0]).toBe(ctx);
    expect(result.wallet).toEqual({ id: 'w1', balance: -20 });
    expect(result.warnings).toEqual([
      'BALANCE_NEGATIVE',
      'OVERDRAFT_LIMIT_EXCEEDED',
    ]);
  });
});

describe('ReverseReceivableUseCase', () => {
  it('estorna: debita a wallet original + movimento SETTLEMENT_REVERSAL', async () => {
    const engine = buildEngine();
    const wallet = new FakeWalletGateway('w1', 100);
    let seq = 0;
    const settle = SettleReceivableUseCase.create(
      engine,
      wallet,
      fakeRunner,
      () => `mov-${++seq}`,
      () => '2026-06-05T00:00:00.000Z',
    );
    const reverse = ReverseReceivableUseCase.create(
      engine,
      wallet,
      fakeRunner,
      () => `mov-${++seq}`,
      () => '2026-06-06T00:00:00.000Z',
    );
    const leafId = await createReceivableLeaf(engine, 30);
    await settle.execute({
      id: leafId,
      userId,
      walletId: 'w1',
      paidAmount: 30,
      paymentDate: '2026-06-05',
      paymentMethodDescriptionEnum: 'PIX',
    });

    const result = await reverse.execute({ id: leafId, userId });

    expect(result.wallet.balance).toBe(100);
    const reversal = wallet.movements.find(
      (m) => m.refType === 'SETTLEMENT_REVERSAL',
    );
    expect(reversal).toMatchObject({
      direction: 'DEBIT',
      refId: leafId,
      amount: 30,
    });
    expect(wallet.savedDates).toEqual({
      occurredAt: '2026-06-06',
      updatedAt: '2026-06-06T00:00:00.000Z',
    });
    expect(result.warnings).toEqual([]);
  });

  it('reversal that makes the balance negative gives a BALANCE_NEGATIVE warning, without blocking', async () => {
    const engine = buildEngine();
    const leafId = await createReceivableLeaf(engine, 40);
    const wallet = new SeededReversalWalletGateway('w1', 10, leafId, 40);
    const reverse = ReverseReceivableUseCase.create(
      engine,
      wallet,
      fakeRunner,
      () => 'mov-rev',
      () => '2026-06-06T00:00:00.000Z',
    );
    await engine.settle.execute({
      id: leafId,
      userId,
      paymentDate: '2026-06-05',
      paidAmount: 40,
      paymentMethodDescriptionEnum: 'PIX',
    });

    const result = await reverse.execute({ id: leafId, userId });

    expect(result.wallet.balance).toBe(-30);
    expect(result.warnings).toContain('BALANCE_NEGATIVE');
  });

  it('no settlement movement gives SETTLEMENT_MOVEMENT_NOT_FOUND', async () => {
    const engine = buildEngine();
    const wallet = new FakeWalletGateway('w1', 100);
    const reverse = ReverseReceivableUseCase.create(
      engine,
      wallet,
      fakeRunner,
      () => 'mov-x',
      () => '2026-06-06T00:00:00.000Z',
    );
    const leafId = await createReceivableLeaf(engine, 30);

    await expect(reverse.execute({ id: leafId, userId })).rejects.toMatchObject(
      {
        code: 'SETTLEMENT_MOVEMENT_NOT_FOUND',
      },
    );
  });

  it('[CDC-07] a settlement of an unreceived leaf on a missing wallet gives WALLET_NOT_FOUND and writes nothing', async () => {
    const engine = buildEngine();
    const wallet = new FakeWalletGateway('w1', 100);
    const reverse = ReverseReceivableUseCase.create(
      engine,
      wallet,
      fakeRunner,
      () => 'mov-x',
      () => '2026-06-06T00:00:00.000Z',
    );
    const leafId = await createReceivableLeaf(engine, 30);
    wallet.movements.push({
      id: 'mov-1',
      userId,
      walletId: 'gone',
      direction: 'CREDIT',
      amount: 30,
      refType: 'SETTLEMENT',
      refId: leafId,
      occurredAt: '2026-06-05',
      createdAt: '2026-06-05T00:00:00.000Z',
    });

    await expect(reverse.execute({ id: leafId, userId })).rejects.toMatchObject(
      { code: 'WALLET_NOT_FOUND' },
    );
    expect(wallet.movements).toHaveLength(1);
  });

  it('[CDC-07] a reversal reads the settlement and loads and saves its wallet with the run context and the input owner, and answers with its balance and warnings', async () => {
    const engine = buildEngine();
    const wallet = new FakeWalletGateway('w1', -50, 5);
    const ctx = { txn: {} } as AtomicContext;
    const runner = {
      run: async <T>(work: (c: AtomicContext) => Promise<T>): Promise<T> =>
        work(ctx),
    } as AtomicRunner;
    const leafId = await createReceivableLeaf(engine, 30);
    await SettleReceivableUseCase.create(
      engine,
      wallet,
      fakeRunner,
      () => 'mov-1',
      () => '2026-06-05T00:00:00.000Z',
    ).execute({
      id: leafId,
      userId,
      walletId: 'w1',
      paidAmount: 30,
      paymentDate: '2026-06-05',
      paymentMethodDescriptionEnum: 'PIX',
    });
    const find = jest.spyOn(wallet, 'findLatestSettlementTx');
    const load = jest.spyOn(wallet, 'loadWalletTx');
    const save = jest.spyOn(wallet, 'saveWalletTx');
    const reverse = ReverseReceivableUseCase.create(
      engine,
      wallet,
      runner,
      () => 'mov-2',
      () => '2026-06-06T00:00:00.000Z',
    );

    const result = await reverse.execute({ id: leafId, userId });

    expect(find).toHaveBeenCalledWith(ctx, leafId, userId);
    expect(find.mock.calls[0][0]).toBe(ctx);
    expect(load).toHaveBeenCalledWith(ctx, 'w1', userId);
    expect(load.mock.calls[0][0]).toBe(ctx);
    expect(save.mock.calls[0][0]).toBe(ctx);
    expect(result.wallet).toEqual({ id: 'w1', balance: -50 });
    expect(result.warnings).toEqual([
      'BALANCE_NEGATIVE',
      'OVERDRAFT_LIMIT_EXCEEDED',
    ]);
  });
});

describe('GlobalSettleReceivableUseCase', () => {
  it('one credit for the total plus one movement per settled leaf', async () => {
    const engine = buildEngine();
    const wallet = new FakeWalletGateway('w1', 100);
    let seq = 0;
    const global = GlobalSettleReceivableUseCase.create(
      engine,
      wallet,
      fakeRunner,
      () => `mov-${++seq}`,
      () => '2026-06-05T00:00:00.000Z',
    );
    const plan = await engine.createInstallmentPlan.execute({
      userId,
      personId: userId,
      type: TransactionTypeEnum.RECEIVABLES,
      amount: 50,
      dueDate: '2026-06-10',
      installments: [
        { amount: 20, dueDate: '2026-06-10' },
        { amount: 30, dueDate: '2026-07-10' },
      ],
    });

    const result = await global.execute({
      nodeId: plan.mother.id,
      userId,
      walletId: 'w1',
      paymentDate: '2026-06-05',
      paymentMethodDescriptionEnum: 'PIX',
    });

    expect(wallet.movements).toHaveLength(2);
    expect(
      wallet.movements.every(
        (m) => m.refType === 'SETTLEMENT' && m.direction === 'CREDIT',
      ),
    ).toBe(true);
    expect(result.wallet.balance).toBe(150);
    expect(wallet.savedDates).toEqual(CREDIT_DATES);
    expect(result.warnings).toEqual([]);
  });

  it('[CDC-07] a plan already settled writes nothing and answers with the wallet it read and its warnings', async () => {
    const engine = buildEngine();
    const wallet = new FakeWalletGateway('w1', -10);
    const global = GlobalSettleReceivableUseCase.create(
      engine,
      wallet,
      fakeRunner,
      () => 'mov-1',
      () => '2026-06-05T00:00:00.000Z',
    );
    const plan = await engine.createInstallmentPlan.execute({
      userId,
      personId: userId,
      type: TransactionTypeEnum.RECEIVABLES,
      amount: 50,
      dueDate: '2026-06-10',
      installments: [{ amount: 50, dueDate: '2026-06-10' }],
    });
    const input = {
      nodeId: plan.mother.id,
      userId,
      walletId: 'w1',
      paymentDate: '2026-06-05',
      paymentMethodDescriptionEnum: 'PIX',
    };
    await engine.globalSettlement.execute(input);

    const result = await global.execute(input);

    expect(wallet.movements).toHaveLength(0);
    expect(wallet.savedDates).toEqual({});
    expect(result.wallet).toEqual({ id: 'w1', balance: -10 });
    expect(result.warnings).toEqual(['BALANCE_NEGATIVE']);
  });

  it('[CDC-07] a missing node on a missing wallet gives WALLET_NOT_FOUND and writes nothing', async () => {
    const wallet = new FakeWalletGateway('w1', 100);
    const global = GlobalSettleReceivableUseCase.create(
      buildEngine(),
      wallet,
      fakeRunner,
      () => 'mov-1',
      () => '2026-06-05T00:00:00.000Z',
    );

    await expect(
      global.execute({
        nodeId: 'missing',
        userId,
        walletId: 'other',
        paymentDate: '2026-06-05',
        paymentMethodDescriptionEnum: 'PIX',
      }),
    ).rejects.toMatchObject({ code: 'WALLET_NOT_FOUND' });
    expect(wallet.movements).toHaveLength(0);
  });

  it('[CDC-07] a global settlement loads and saves the wallet with the run context and the input owner, and answers with its balance and warnings', async () => {
    const engine = buildEngine();
    const wallet = new FakeWalletGateway('w1', -50, 5);
    const ctx = { txn: {} } as AtomicContext;
    const runner = {
      run: async <T>(work: (c: AtomicContext) => Promise<T>): Promise<T> =>
        work(ctx),
    } as AtomicRunner;
    const load = jest.spyOn(wallet, 'loadWalletTx');
    const save = jest.spyOn(wallet, 'saveWalletTx');
    const global = GlobalSettleReceivableUseCase.create(
      engine,
      wallet,
      runner,
      () => 'mov-1',
      () => '2026-06-05T00:00:00.000Z',
    );
    const plan = await engine.createInstallmentPlan.execute({
      userId,
      personId: userId,
      type: TransactionTypeEnum.RECEIVABLES,
      amount: 30,
      dueDate: '2026-06-10',
      installments: [{ amount: 30, dueDate: '2026-06-10' }],
    });

    const result = await global.execute({
      nodeId: plan.mother.id,
      userId,
      walletId: 'w1',
      paymentDate: '2026-06-05',
      paymentMethodDescriptionEnum: 'PIX',
    });

    expect(load).toHaveBeenCalledWith(ctx, 'w1', userId);
    expect(load.mock.calls[0][0]).toBe(ctx);
    expect(save.mock.calls[0][0]).toBe(ctx);
    expect(result.wallet).toEqual({ id: 'w1', balance: -20 });
    expect(result.warnings).toEqual([
      'BALANCE_NEGATIVE',
      'OVERDRAFT_LIMIT_EXCEEDED',
    ]);
  });
});

describe('ListUnreceivedByPeriodUseCase', () => {
  it('fixa scope/type e o range de dueDate, SEM originNotIn', async () => {
    const engine = buildEngine();
    const calls: Record<string, unknown>[] = [];
    (engine.list as unknown as { execute: unknown }).execute = async (
      input: Record<string, unknown>,
    ) => {
      calls.push(input);
      return { content: [], page: 0, size: 20, totalElements: 0 };
    };
    const uc = ListUnreceivedByPeriodUseCase.create(engine);

    await uc.execute({
      userId,
      startDate: '2026-06-01',
      endDate: '2026-06-30',
    });

    expect(calls[0]).toMatchObject({
      scope: 'to_pay',
      type: 'RECEIVABLES',
      dueDateFrom: '2026-06-01',
      dueDateTo: '2026-06-30',
      userId,
    });
    expect(calls[0].originNotIn).toBeUndefined();
  });

  it('end_date < start_date gives ValidationError', async () => {
    const engine = buildEngine();
    const uc = ListUnreceivedByPeriodUseCase.create(engine);

    await expect(
      uc.execute({ userId, startDate: '2026-06-30', endDate: '2026-06-01' }),
    ).rejects.toMatchObject({ code: 'VALIDATION_FAILED' });
  });

  it('passes the list params to the engine', async () => {
    const engine = buildEngine();
    const calls: unknown[] = [];
    (engine.list as unknown as { execute: unknown }).execute = async (
      input: unknown,
    ) => calls.push(input);
    const params = { sort: { field: 'paymentStatus', value: 'OVERDUE' } };
    await ListUnreceivedByPeriodUseCase.create(engine).execute({
      userId,
      startDate: '2026-06-01',
      endDate: '2026-06-30',
      params,
    });
    expect(calls[0]).toMatchObject({ params });
  });
});

describe('CreateSingleReceivableUseCase', () => {
  function build(
    engine = buildEngine(),
    wallet = new FakeWalletGateway('w1', 100),
  ) {
    const uc = CreateSingleReceivableUseCase.create(
      engine,
      wallet,
      fakeRunner,
      () => 'mov-1',
      () => '2026-06-05T00:00:00.000Z',
    );
    return { uc, wallet };
  }

  it('to receive creates only the root (RECEIVABLES, no wallet)', async () => {
    const { uc } = build();
    const result = await uc.execute({
      userId,
      amount: 80,
      dueDate: '2026-06-10',
    });
    expect(result.root.type).toBe('RECEIVABLES');
    expect(result.root.paid).toBe(false);
    expect(result.wallet).toBeUndefined();
  });

  it('born received creates and credits atomically (wallet + warnings)', async () => {
    const { uc, wallet } = build();
    const result = await uc.execute({
      userId,
      amount: 30,
      dueDate: '2026-06-10',
      paymentMethodDescriptionEnum: 'PIX',
      paidAt: '2026-06-05',
      walletId: 'w1',
    });
    expect(result.root.paid).toBe(true);
    expect(result.wallet).toEqual({ id: 'w1', balance: 130 });
    expect(wallet.movements).toHaveLength(1);
    expect(wallet.movements[0]).toMatchObject({ direction: 'CREDIT' });
    expect(wallet.savedDates).toEqual(CREDIT_DATES);
    expect(result.warnings).toEqual([]);
  });

  it('[CDC-08] a retried run that drops the first attempt writes reads the wallet again: a born-received receivable of 300 on a wallet of 1000 leaves 1300 and one movement', async () => {
    const wallet = new FakeWalletGateway('w1', 1000);
    const uc = CreateSingleReceivableUseCase.create(
      buildEngine(),
      wallet,
      retryingRunner(wallet),
      () => 'mov-1',
      () => '2026-06-05T00:00:00.000Z',
    );

    await uc.execute({
      userId,
      amount: 300,
      dueDate: '2026-06-10',
      paymentMethodDescriptionEnum: 'PIX',
      paidAt: '2026-06-05',
      walletId: 'w1',
    });

    expect(wallet.balance).toBe(1300);
    expect(wallet.movements).toHaveLength(1);
  });

  it('[CDC-07] a born-received receivable with an unknown payment method on a missing wallet gives WALLET_NOT_FOUND and writes nothing', async () => {
    const { uc, wallet } = build();
    await expect(
      uc.execute({
        userId,
        amount: 30,
        dueDate: '2026-06-10',
        paymentMethodDescriptionEnum: 'BOLETO',
        paidAt: '2026-06-05',
        walletId: 'other',
      }),
    ).rejects.toMatchObject({ code: 'WALLET_NOT_FOUND' });
    expect(wallet.movements).toHaveLength(0);
  });

  it('[CDC-07] a born-received receivable loads and saves the wallet with the run context and the input owner, and answers with its balance and warnings', async () => {
    const wallet = new FakeWalletGateway('w1', -50, 5);
    const ctx = { txn: {} } as AtomicContext;
    const runner = {
      run: async <T>(work: (c: AtomicContext) => Promise<T>): Promise<T> =>
        work(ctx),
    } as AtomicRunner;
    const load = jest.spyOn(wallet, 'loadWalletTx');
    const save = jest.spyOn(wallet, 'saveWalletTx');
    const uc = CreateSingleReceivableUseCase.create(
      buildEngine(),
      wallet,
      runner,
      () => 'mov-1',
      () => '2026-06-05T00:00:00.000Z',
    );

    const result = await uc.execute({
      userId,
      amount: 30,
      dueDate: '2026-06-10',
      paymentMethodDescriptionEnum: 'PIX',
      paidAt: '2026-06-05',
      walletId: 'w1',
    });

    expect(load).toHaveBeenCalledWith(ctx, 'w1', userId);
    expect(load.mock.calls[0][0]).toBe(ctx);
    expect(save.mock.calls[0][0]).toBe(ctx);
    expect(result.wallet).toEqual({ id: 'w1', balance: -20 });
    expect(result.warnings).toEqual([
      'BALANCE_NEGATIVE',
      'OVERDRAFT_LIMIT_EXCEEDED',
    ]);
  });

  it('born received without walletId gives ValidationError', async () => {
    const { uc } = build();
    await expect(
      uc.execute({
        userId,
        amount: 30,
        dueDate: '2026-06-10',
        paidAt: '2026-06-05',
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION_FAILED' });
  });
});

describe('CreateInstallmentReceivableUseCase', () => {
  function build(
    engine = buildEngine(),
    wallet = new FakeWalletGateway('w1', 100),
  ) {
    return {
      uc: CreateInstallmentReceivableUseCase.create(
        engine,
        wallet,
        fakeRunner,
        () => 'mov-e',
        () => '2026-06-05T00:00:00.000Z',
      ),
      wallet,
    };
  }

  it('without down payment creates only the root (parent equals the sum of installments)', async () => {
    const { uc, wallet } = build();
    const result = await uc.execute({
      userId,
      amount: 50,
      dueDate: '2026-06-10',
      installments: [
        { amount: 20, dueDate: '2026-06-10' },
        { amount: 30, dueDate: '2026-07-10' },
      ],
    });
    expect(result.root.currentAmount).toBe(50);
    expect(wallet.movements).toHaveLength(0);
  });

  it('down payment without walletId gives ValidationError', async () => {
    const { uc } = build();
    await expect(
      uc.execute({
        userId,
        amount: 50,
        dueDate: '2026-06-10',
        installments: [{ amount: 50, dueDate: '2026-06-10' }],
        entry: {
          amount: 10,
          paymentDate: '2026-06-05',
          paymentMethodDescriptionEnum: 'PIX',
          walletId: '',
        },
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION_FAILED' });
  });

  it('received down payment records its cash (credit + movement)', async () => {
    const { uc, wallet } = build();
    const result = await uc.execute({
      userId,
      amount: 50,
      dueDate: '2026-06-10',
      installments: [{ amount: 40, dueDate: '2026-07-10' }],
      entry: {
        amount: 10,
        paymentDate: '2026-06-05',
        paymentMethodDescriptionEnum: 'PIX',
        walletId: 'w1',
      },
    });
    expect(result.wallet).toEqual({ id: 'w1', balance: 110 });
    expect(wallet.movements).toHaveLength(1);
    expect(wallet.movements[0]).toMatchObject({
      direction: 'CREDIT',
      refType: 'SETTLEMENT',
      amount: 10,
    });
    expect(wallet.savedDates).toEqual(CREDIT_DATES);
    expect(result.warnings).toEqual([]);
  });

  it('[CDC-07] a received down payment with an unknown payment method on a missing wallet gives WALLET_NOT_FOUND and writes nothing', async () => {
    const { uc, wallet } = build();
    await expect(
      uc.execute({
        userId,
        amount: 50,
        dueDate: '2026-06-10',
        installments: [{ amount: 40, dueDate: '2026-07-10' }],
        entry: {
          amount: 10,
          paymentDate: '2026-06-05',
          paymentMethodDescriptionEnum: 'BOLETO',
          walletId: 'other',
        },
      }),
    ).rejects.toMatchObject({ code: 'WALLET_NOT_FOUND' });
    expect(wallet.movements).toHaveLength(0);
  });

  it('[CDC-07] a received down payment loads and saves the wallet with the run context and the input owner, and answers with its balance and warnings', async () => {
    const wallet = new FakeWalletGateway('w1', -30, 5);
    const ctx = { txn: {} } as AtomicContext;
    const runner = {
      run: async <T>(work: (c: AtomicContext) => Promise<T>): Promise<T> =>
        work(ctx),
    } as AtomicRunner;
    const load = jest.spyOn(wallet, 'loadWalletTx');
    const save = jest.spyOn(wallet, 'saveWalletTx');
    const uc = CreateInstallmentReceivableUseCase.create(
      buildEngine(),
      wallet,
      runner,
      () => 'mov-e',
      () => '2026-06-05T00:00:00.000Z',
    );

    const result = await uc.execute({
      userId,
      amount: 50,
      dueDate: '2026-06-10',
      installments: [{ amount: 40, dueDate: '2026-07-10' }],
      entry: {
        amount: 10,
        paymentDate: '2026-06-05',
        paymentMethodDescriptionEnum: 'PIX',
        walletId: 'w1',
      },
    });

    expect(load).toHaveBeenCalledWith(ctx, 'w1', userId);
    expect(load.mock.calls[0][0]).toBe(ctx);
    expect(save.mock.calls[0][0]).toBe(ctx);
    expect(result.wallet).toEqual({ id: 'w1', balance: -20 });
    expect(result.warnings).toEqual([
      'BALANCE_NEGATIVE',
      'OVERDRAFT_LIMIT_EXCEEDED',
    ]);
  });
});

describe('thin read/mutation use-cases', () => {
  it('ListReceivables fixes the RECEIVABLES type and passes scope and period through', async () => {
    const engine = buildEngine();
    const calls: unknown[] = [];
    (engine.list as unknown as { execute: unknown }).execute = async (
      input: unknown,
    ) => {
      calls.push(input);
      return { content: [], page: 0, size: 20, totalElements: 0 };
    };
    await ListReceivablesUseCase.create(engine).execute({
      userId,
      scope: 'to_pay',
      month: 6,
      year: 2026,
    });
    expect(calls[0]).toMatchObject({
      type: 'RECEIVABLES',
      scope: 'to_pay',
      month: 6,
    });
  });

  it('ListReceivables passes the list params to the engine', async () => {
    const engine = buildEngine();
    const calls: unknown[] = [];
    (engine.list as unknown as { execute: unknown }).execute = async (
      input: unknown,
    ) => calls.push(input);
    const params = { sort: { field: 'paymentStatus', value: 'OVERDUE' } };
    await ListReceivablesUseCase.create(engine).execute({
      userId,
      scope: 'to_pay',
      params,
    });
    expect(calls[0]).toMatchObject({ params });
  });

  it('GetReceivableById delega ao motor', async () => {
    const engine = buildEngine();
    const leafId = await createReceivableLeaf(engine, 10);
    const detail = await GetReceivableByIdUseCase.create(engine).execute(
      leafId,
      userId,
    );
    expect(detail.node.id).toBe(leafId);
  });

  it('EditReceivable delega e devolve output', async () => {
    const engine = buildEngine();
    const leafId = await createReceivableLeaf(engine, 10);
    const out = await EditReceivableUseCase.create(engine).execute({
      id: leafId,
      userId,
      amount: 25,
    });
    expect(out.amount).toBe(25);
  });

  it('SoftDeleteReceivable delegates to the engine (resolves to undefined)', async () => {
    const engine = buildEngine();
    const leafId = await createReceivableLeaf(engine, 10);
    await expect(
      SoftDeleteReceivableUseCase.create(engine).execute(leafId, userId),
    ).resolves.toBeUndefined();
  });
});
