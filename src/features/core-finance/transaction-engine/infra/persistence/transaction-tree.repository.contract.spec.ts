import { Firestore } from 'firebase-admin/firestore';
import {
  CreateTransactionInput,
  Transaction,
} from '@/features/core-finance/transaction-engine/domain/transaction.entity';
import {
  ListTransactionsQuery,
  TransactionTreeRepository,
} from '@/features/core-finance/transaction-engine/domain/ports/transaction-tree.repository.port';
import { InMemoryTransactionTreeRepository } from '@/features/core-finance/transaction-engine/infra/persistence/in-memory-transaction-tree.repository';
import { TransactionTreeRepositoryFirestore } from '@/features/core-finance/transaction-engine/infra/persistence/transaction-tree.repository.firestore';
import { AtomicContext, AtomicRunner } from '@/shared/database/atomic-runner';
import { PaymentStatusEnum } from '@/shared/kernel/enums/payment-status.enum';
import { Money } from '@/shared/kernel/value-objects/money.vo';
import { firestoreEmulator } from '@/test/support/firestore-emulator';

jest.setTimeout(60_000);

let db: Firestore;

beforeAll(async () => {
  db = await firestoreEmulator.connect();
});
beforeEach(() => firestoreEmulator.clear());
afterAll(() => db.terminate());

const DELETED_AT = '2026-06-15T00:00:00.000Z';

type NodeOverrides = Partial<
  Omit<CreateTransactionInput, 'amount' | 'paidAmount'>
> & { amount?: number; paidAmount?: number; deleted?: boolean };

function node({
  amount = 100,
  paidAmount,
  deleted = false,
  ...overrides
}: NodeOverrides = {}) {
  const id = overrides.id ?? 'n1';
  const created = Transaction.create({
    id,
    parentId: null,
    rootId: id,
    userId: 'u1',
    personId: 'u1',
    type: 'BILLS',
    dueDate: '2026-06-10',
    createdAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
    amount: Money.create(amount),
    paidAmount: paidAmount === undefined ? null : Money.create(paidAmount),
  });
  if (deleted) created.softDelete(DELETED_AT);
  return created;
}

function child(id: string, parentId: string, overrides: NodeOverrides = {}) {
  return node({ id, parentId, rootId: 'r1', ...overrides });
}

const PAID: NodeOverrides = {
  paymentDate: '2026-06-12',
  paidAmount: 100,
  paymentMethodDescriptionEnum: 'PIX',
};

const ids = (items: { id: string }[]) => items.map((item) => item.id).sort();

type RunAtomic = (work: (ctx: AtomicContext) => Promise<void>) => Promise<void>;

const adapters: [string, () => TransactionTreeRepository, RunAtomic][] = [
  [
    'in-memory',
    () => new InMemoryTransactionTreeRepository(),
    (work) => work({} as AtomicContext),
  ],
  [
    'firestore (emulator)',
    () => TransactionTreeRepositoryFirestore.create(db),
    (work) => AtomicRunner.create(db).run(work),
  ],
];

const leafFilters: [
  string,
  Partial<ListTransactionsQuery>,
  NodeOverrides,
  NodeOverrides,
][] = [
  ['rootId', { rootId: 'r1' }, { rootId: 'r1' }, { rootId: 'r2' }],
  ['type', { type: 'RECEIVABLES' }, { type: 'RECEIVABLES' }, {}],
  [
    'categoryDescriptionEnum',
    { categoryDescriptionEnum: 'FOOD' },
    { categoryDescriptionEnum: 'FOOD' },
    { categoryDescriptionEnum: 'RENT' },
  ],
  ['paymentStatus', { paymentStatus: PaymentStatusEnum.PAID }, PAID, {}],
  [
    'paymentMethodDescriptionEnum',
    { paymentMethodDescriptionEnum: 'PIX' },
    PAID,
    { ...PAID, paymentMethodDescriptionEnum: 'CASH' },
  ],
  [
    'rootHasInstallments',
    { rootHasInstallments: true },
    { rootHasInstallments: true },
    {},
  ],
  ['rootIsFixedCost', { rootIsFixedCost: true }, { rootIsFixedCost: true }, {}],
  ['origin', { origin: 'IMPORT' }, { origin: 'IMPORT' }, {}],
  ['originNotIn', { originNotIn: ['IMPORT'] }, {}, { origin: 'IMPORT' }],
  ['refMonthDueDate', { refMonthDueDate: 7 }, { dueDate: '2026-07-10' }, {}],
  ['refYearDueDate', { refYearDueDate: 2027 }, { dueDate: '2027-06-10' }, {}],
  [
    'refMonthPaymentDate',
    { refMonthPaymentDate: 6 },
    PAID,
    { ...PAID, paymentDate: '2026-07-12' },
  ],
  [
    'refYearPaymentDate',
    { refYearPaymentDate: 2026 },
    PAID,
    { ...PAID, paymentDate: '2027-06-12' },
  ],
  [
    'dueDate range',
    { dueDateFrom: '2026-06-01', dueDateTo: '2026-06-30' },
    {},
    { dueDate: '2026-07-10' },
  ],
  [
    'paymentDate range',
    { paymentDateFrom: '2026-06-01', paymentDateTo: '2026-06-30' },
    PAID,
    {},
  ],
  ['amount range', { amountMin: 50, amountMax: 150 }, {}, { amount: 20 }],
  ['paidAmount range', { paidAmountMin: 50, paidAmountMax: 150 }, PAID, {}],
];

describe.each(adapters)(
  'TransactionTreeRepository contract - %s',
  (_name, makeRepository, runAtomic) => {
    it('[BK3-16] save then findActiveById returns the node to its owner, and null to another owner, for a deleted node and for a missing id', async () => {
      const repository = makeRepository();
      await repository.save(node());
      await repository.save(node({ id: 'n2', deleted: true }));

      expect(
        (await repository.findActiveById('n1', 'u1'))?.toPersistence(),
      ).toEqual(node().toPersistence());
      expect(await repository.findActiveById('n1', 'u2')).toBeNull();
      expect(await repository.findActiveById('n2', 'u1')).toBeNull();
      expect(await repository.findActiveById('missing', 'u1')).toBeNull();
    });

    it('[BK3-16] saveMany then findChildren returns only the live children of the parent', async () => {
      const repository = makeRepository();
      await repository.saveMany([
        node({ id: 'r1', hasChildren: true }),
        child('c1', 'r1'),
        child('c2', 'r1'),
        child('c3', 'r1', { deleted: true }),
        child('g1', 'c1'),
      ]);

      expect(ids(await repository.findChildren('r1'))).toEqual(['c1', 'c2']);
    });

    it('[BK3-16] loadSubtree returns the root and its descendants, and [] for a missing or deleted root', async () => {
      const repository = makeRepository();
      await repository.saveMany([
        node({ id: 'r1', hasChildren: true }),
        child('c1', 'r1', { hasChildren: true }),
        child('g1', 'c1'),
        child('c2', 'r1'),
        child('c3', 'r1', { deleted: true }),
        node({ id: 'r2' }),
        node({ id: 'r3', deleted: true }),
      ]);

      expect(ids(await repository.loadSubtree('r1'))).toEqual([
        'c1',
        'c2',
        'g1',
        'r1',
      ]);
      expect(await repository.loadSubtree('missing')).toEqual([]);
      expect(await repository.loadSubtree('r3')).toEqual([]);
    });

    it('[BK3-16] listLeaves returns only the live leaves of the owner', async () => {
      const repository = makeRepository();
      await repository.saveMany([
        node({ id: 'l1' }),
        node({ id: 'l2' }),
        node({ id: 'r1', hasChildren: true }),
        node({ id: 'l3', deleted: true }),
        node({ id: 'l4', userId: 'u2' }),
      ]);

      expect(ids(await repository.listLeaves({ userId: 'u1' }))).toEqual([
        'l1',
        'l2',
      ]);
    });

    it('[BK3-16] listLeaves filters by paid when it comes', async () => {
      const repository = makeRepository();
      await repository.saveMany([
        node({ id: 'open' }),
        node({ id: 'settled', ...PAID }),
      ]);

      expect(
        ids(await repository.listLeaves({ userId: 'u1', paid: true })),
      ).toEqual(['settled']);
      expect(
        ids(await repository.listLeaves({ userId: 'u1', paid: false })),
      ).toEqual(['open']);
    });

    it.each(leafFilters)(
      '[BK3-16] listLeaves applies the %s filter alone',
      async (_filterName, filter, matching, other) => {
        const repository = makeRepository();
        await repository.saveMany([
          node({ id: 'match', ...matching }),
          node({ id: 'other', ...other }),
        ]);

        expect(
          ids(await repository.listLeaves({ userId: 'u1', ...filter })),
        ).toEqual(['match']);
      },
    );

    it('[BK3-16] listDeleted returns the deleted nodes, and only those of the root when rootId comes', async () => {
      const repository = makeRepository();
      await repository.saveMany([
        node({ id: 'live' }),
        child('d1', 'r1', { deleted: true }),
        node({ id: 'd2', rootId: 'r2', deleted: true }),
      ]);

      expect(ids(await repository.listDeleted())).toEqual(['d1', 'd2']);
      expect(ids(await repository.listDeleted('r1'))).toEqual(['d1']);
    });

    it('[BK3-16] saveTx and saveManyTx inside the adapter atomic run write the same as save and saveMany', async () => {
      const repository = makeRepository();

      await runAtomic((ctx) =>
        repository.saveTx(ctx, node({ id: 'r1', hasChildren: true })),
      );
      await runAtomic((ctx) =>
        repository.saveManyTx(ctx, [child('c1', 'r1'), child('c2', 'r1')]),
      );

      expect(
        (await repository.findActiveById('r1', 'u1'))?.toPersistence(),
      ).toEqual(node({ id: 'r1', hasChildren: true }).toPersistence());
      expect(ids(await repository.findChildren('r1'))).toEqual(['c1', 'c2']);
    });
  },
);
