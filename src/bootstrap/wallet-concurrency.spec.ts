import { Firestore } from 'firebase-admin/firestore';
import { CoreFinanceWalletGatewayAdapter } from '@/bootstrap/core-finance-wallet.gateway.adapter';
import { SettleBillUseCase } from '@/features/core-finance/bills/application/settle-bill.usecase';
import { makeTransactionEngine } from '@/features/core-finance/transaction-engine/transaction-engine.factory';
import { Wallet } from '@/features/wallet/domain/wallet.entity';
import { WalletMovementDirectionEnum } from '@/features/wallet/domain/enums/wallet-movement.enums';
import { WalletRepositoryFirestore } from '@/features/wallet/infra/persistence/wallet.repository.firestore';
import { AtomicContext, AtomicRunner } from '@/shared/database/atomic-runner';
import { TransactionTypeEnum } from '@/shared/kernel/enums/transaction-type.enum';
import { firestoreEmulator } from '@/test/support/firestore-emulator';

jest.setTimeout(60_000);

let db: Firestore;

beforeAll(async () => {
  db = await firestoreEmulator.connect();
});
beforeEach(() => firestoreEmulator.clear());
afterAll(() => db.terminate());

const userId = 'u1';

/**
 * Opens each transaction only after both settles asked for one, so a wallet read made before
 * the transaction is stale for one of the two writes every time.
 */
function runnerOpeningTogether(): AtomicRunner {
  const runner = AtomicRunner.create(db);
  let asked = 0;
  let openBoth: () => void = () => undefined;
  const bothAsked = new Promise<void>((resolve) => {
    openBoth = resolve;
  });
  return {
    run: async <T>(work: (ctx: AtomicContext) => Promise<T>): Promise<T> => {
      asked += 1;
      if (asked === 2) openBoth();
      await bothAsked;
      return runner.run(work);
    },
  } as AtomicRunner;
}

describe('wallet concurrency across features (emulator)', () => {
  it('[CDC-09] two settles of bills on the same wallet in parallel leave the balance at the initial one minus both payments and equal to the initial one plus the recorded movements', async () => {
    const wallets = WalletRepositoryFirestore.create(db);
    await wallets.create(
      Wallet.create({
        id: 'w1',
        userId,
        name: 'Cartera',
        balance: 1000,
        createdAt: '2026-06-01T00:00:00.000Z',
      }),
      [],
    );
    const engine = makeTransactionEngine({
      db,
      categoryGateway: { resolve: async () => null },
      paymentMethodGateway: { isActive: async () => true },
    });
    let sequence = 0;
    const settle = SettleBillUseCase.create(
      engine,
      CoreFinanceWalletGatewayAdapter.create(db, wallets),
      runnerOpeningTogether(),
      () => `mov-${++sequence}`,
      () => '2026-06-05T00:00:00.000Z',
    );
    const bill = (amount: number) =>
      engine.createSingle.execute({
        userId,
        personId: userId,
        type: TransactionTypeEnum.BILLS,
        amount,
        dueDate: '2026-06-10',
      });
    const [first, second] = await Promise.all([bill(300), bill(200)]);
    const pay = (id: string, paidAmount: number) =>
      settle.execute({
        id,
        userId,
        walletId: 'w1',
        paidAmount,
        paymentDate: '2026-06-05',
        paymentMethodDescriptionEnum: 'PIX',
      });

    await Promise.all([pay(first.id, 300), pay(second.id, 200)]);

    const balance = (await wallets.findById('w1', userId))?.balance.value;
    const recorded = (await wallets.listMovements('w1', userId)).reduce(
      (sum, movement) =>
        movement.direction === WalletMovementDirectionEnum.CREDIT
          ? sum + movement.amount.value
          : sum - movement.amount.value,
      0,
    );
    expect(balance).toBe(500);
    expect(balance).toBe(1000 + recorded);
  });
});
