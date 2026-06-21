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
  WalletGateway,
} from '@/features/core-finance/shared/ports/wallet.gateway.port';
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

class FakeWalletGateway implements WalletGateway {
  public readonly movements: WalletMovementSpec[] = [];
  private balance: number;

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
      overdraftLimit: this.overdraftLimit,
      overdraftSince: null,
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
      overdraftLimit: 0,
      overdraftSince: null,
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
  });

  it('wallet inexistente → WALLET_NOT_FOUND (sem gravar)', async () => {
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
        paymentMethodDescriptionEnum: 'PIX',
      }),
    ).rejects.toMatchObject({ code: 'WALLET_NOT_FOUND' });
    expect(wallet.movements).toHaveLength(0);
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
  });

  it('estorno que negativa o saldo → warning BALANCE_NEGATIVE, sem bloquear', async () => {
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

  it('sem movimento de liquidação → SETTLEMENT_MOVEMENT_NOT_FOUND', async () => {
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
});

describe('GlobalSettleReceivableUseCase', () => {
  it('um único crédito pelo total + um movimento por folha settlada', async () => {
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

  it('end_date < start_date → ValidationError', async () => {
    const engine = buildEngine();
    const uc = ListUnreceivedByPeriodUseCase.create(engine);

    await expect(
      uc.execute({ userId, startDate: '2026-06-30', endDate: '2026-06-01' }),
    ).rejects.toMatchObject({ code: 'VALIDATION_FAILED' });
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

  it('a receber → só root (RECEIVABLES, sem wallet)', async () => {
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

  it('nascida recebida → cria e credita atomicamente (wallet + warnings)', async () => {
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
  });

  it('nascida recebida sem walletId → ValidationError', async () => {
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

  it('sem entrada → só root (mãe = Σ parcelas)', async () => {
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

  it('entrada sem walletId → ValidationError', async () => {
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

  it('entrada recebida → registra caixa da entrada (crédito + movimento)', async () => {
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
  });
});

describe('thin read/mutation use-cases', () => {
  it('ListReceivables fixa o type RECEIVABLES e repassa scope/competência', async () => {
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

  it('SoftDeleteReceivable delega ao motor (não lança)', async () => {
    const engine = buildEngine();
    const leafId = await createReceivableLeaf(engine, 10);
    await expect(
      SoftDeleteReceivableUseCase.create(engine).execute(leafId, userId),
    ).resolves.toBeUndefined();
  });
});
