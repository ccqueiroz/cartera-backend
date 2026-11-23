import { Firestore } from 'firebase-admin/firestore';
import { Wallet } from '@/features/wallet/domain/wallet.entity';
import { WalletMovement } from '@/features/wallet/domain/wallet-movement.entity';
import {
  WalletMovementDirectionEnum,
  WalletMovementRefTypeEnum,
} from '@/features/wallet/domain/enums/wallet-movement.enums';
import { WalletRepository } from '@/features/wallet/domain/ports/wallet.repository.port';
import { InMemoryWalletRepository } from '@/features/wallet/infra/persistence/in-memory-wallet.repository';
import { WalletRepositoryFirestore } from '@/features/wallet/infra/persistence/wallet.repository.firestore';
import { AtomicContext, AtomicRunner } from '@/shared/database/atomic-runner';
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

function wallet(
  overrides: Partial<{
    id: string;
    userId: string;
    balance: number;
    isDefault: boolean;
  }> = {},
) {
  return Wallet.create({
    id: overrides.id ?? 'w1',
    userId: overrides.userId ?? 'u1',
    name: 'Cartera',
    balance: overrides.balance ?? 0,
    isDefault: overrides.isDefault ?? false,
    createdAt: '2026-06-01T00:00:00.000Z',
  });
}

function deletedWallet(id: string, isDefault = false) {
  const removed = wallet({ id, isDefault });
  removed.softDelete(DELETED_AT);
  return removed;
}

function movement(
  overrides: Partial<{
    id: string;
    userId: string;
    walletId: string;
    direction: WalletMovementDirectionEnum;
    amount: number;
    occurredAt: string;
  }> = {},
) {
  return WalletMovement.create({
    id: overrides.id ?? 'm1',
    userId: overrides.userId ?? 'u1',
    walletId: overrides.walletId ?? 'w1',
    direction: overrides.direction ?? WalletMovementDirectionEnum.CREDIT,
    amount: Money.create(overrides.amount ?? 100),
    refType: WalletMovementRefTypeEnum.ADJUST,
    refId: null,
    occurredAt: overrides.occurredAt ?? '2026-06-10',
    createdAt: '2026-06-10T00:00:00.000Z',
  });
}

const signedDelta = (m: WalletMovement): number =>
  (m.direction === WalletMovementDirectionEnum.CREDIT ? 1 : -1) *
  m.amount.value;

const balanceMovements = () => [
  movement({ id: 'm1', amount: 100 }),
  movement({
    id: 'm2',
    direction: WalletMovementDirectionEnum.DEBIT,
    amount: 30,
  }),
];

const ids = (items: { id: string }[]) => items.map((item) => item.id).sort();

function settlement(
  id: string,
  refId: string,
  createdAt: string,
  userId = 'u1',
  refType = WalletMovementRefTypeEnum.SETTLEMENT,
) {
  return WalletMovement.with({
    ...movement({ id, userId }).toPersistence(),
    refType,
    refId,
    createdAt,
  });
}

type RunAtomic = (work: (ctx: AtomicContext) => Promise<void>) => Promise<void>;

const adapters: [string, () => WalletRepository, RunAtomic][] = [
  [
    'in-memory',
    () => new InMemoryWalletRepository(),
    (work) => work({} as AtomicContext),
  ],
  [
    'firestore (emulator)',
    () => WalletRepositoryFirestore.create(db),
    (work) => AtomicRunner.create(db).run(work),
  ],
];

describe.each(adapters)(
  'WalletRepository contract - %s',
  (_name, makeRepository, runAtomic) => {
    async function expectReconciledBalance(repository: WalletRepository) {
      const stored = await repository.findById('w1', 'u1');
      const ledger = await repository.listMovements('w1', 'u1');
      const sum = ledger.reduce((acc, m) => acc + signedDelta(m), 0);
      expect(ids(ledger)).toEqual(['m1', 'm2']);
      expect(stored?.balance.value).toBe(70);
      expect(Number(sum.toFixed(2))).toBe(70);
    }

    it('[BK3-09] create then findById returns the wallet, and null for another owner and for a missing id', async () => {
      const repository = makeRepository();
      await repository.create(wallet({ balance: 100 }), [movement()]);

      expect((await repository.findById('w1', 'u1'))?.toPersistence()).toEqual(
        wallet({ balance: 100 }).toPersistence(),
      );
      expect(ids(await repository.listMovements('w1', 'u1'))).toEqual(['m1']);
      expect(await repository.findById('w1', 'u2')).toBeNull();
      expect(await repository.findById('missing', 'u1')).toBeNull();
    });

    it('[BK3-09] findActiveById returns null for a deleted wallet, for another owner and for a missing id', async () => {
      const repository = makeRepository();
      await repository.create(wallet(), []);
      await repository.create(deletedWallet('w2'), []);

      expect((await repository.findActiveById('w1', 'u1'))?.id).toBe('w1');
      expect(await repository.findActiveById('w2', 'u1')).toBeNull();
      expect(await repository.findActiveById('w1', 'u2')).toBeNull();
      expect(await repository.findActiveById('missing', 'u1')).toBeNull();
    });

    it('[BK3-09] listActiveByUser returns only the active wallets of the owner', async () => {
      const repository = makeRepository();
      await repository.create(wallet({ id: 'w2' }), []);
      await repository.create(wallet({ id: 'w1' }), []);
      await repository.create(deletedWallet('w3'), []);
      await repository.create(wallet({ id: 'w4', userId: 'u2' }), []);

      expect(ids(await repository.listActiveByUser('u1'))).toEqual([
        'w1',
        'w2',
      ]);
    });

    it('[BK3-09] findDefaultByUser returns the active default wallet and null without it', async () => {
      const repository = makeRepository();
      await repository.create(wallet({ id: 'w1' }), []);
      await repository.create(deletedWallet('w2', true), []);
      await repository.create(
        wallet({ id: 'w3', userId: 'u2', isDefault: true }),
        [],
      );

      expect(await repository.findDefaultByUser('u1')).toBeNull();

      await repository.create(wallet({ id: 'w4', isDefault: true }), []);

      expect((await repository.findDefaultByUser('u1'))?.id).toBe('w4');
    });

    it('[BK3-09] saveWithMovements writes the balance and the movements, and the reread movements add up to the reread balance', async () => {
      const repository = makeRepository();

      await repository.saveWithMovements(
        wallet({ balance: 70 }),
        balanceMovements(),
      );

      await expectReconciledBalance(repository);
    });

    it('[BK3-09] saveWithMovementsTx inside the adapter atomic run writes the balance and the movements', async () => {
      const repository = makeRepository();

      await runAtomic((ctx) =>
        repository.saveWithMovementsTx(
          ctx,
          wallet({ balance: 70 }),
          balanceMovements(),
        ),
      );

      await expectReconciledBalance(repository);
    });

    it('[BK3-09] update rewrites the wallet', async () => {
      const repository = makeRepository();
      await repository.create(wallet(), []);
      const edited = wallet();
      edited.edit({ name: 'Renamed', updatedAt: DELETED_AT });

      await repository.update(edited);

      expect(
        (await repository.findById('w1', 'u1'))?.toPersistence(),
      ).toMatchObject({ name: 'Renamed', updatedAt: DELETED_AT });
    });

    it('[BK3-09] listMovements returns only the movements of the wallet and owner, by occurredAt ascending', async () => {
      const repository = makeRepository();
      await repository.saveWithMovements(wallet(), [
        movement({ id: 'm1', occurredAt: '2026-06-12' }),
        movement({ id: 'm2', occurredAt: '2026-06-10' }),
        movement({ id: 'm3', occurredAt: '2026-06-11' }),
        movement({ id: 'foreign', userId: 'u2', occurredAt: '2026-06-09' }),
        movement({ id: 'other', walletId: 'w2', occurredAt: '2026-06-08' }),
      ]);

      const ledger = await repository.listMovements('w1', 'u1');

      expect(ledger.map((m) => m.id)).toEqual(['m2', 'm3', 'm1']);
    });

    it('[CDC-01] findActiveByIdTx inside the atomic run returns the active wallet of the owner, and null for a deleted wallet, for another owner and for a missing id', async () => {
      const repository = makeRepository();
      await repository.create(wallet({ balance: 100 }), []);
      await repository.create(deletedWallet('w2'), []);
      let found: (Wallet | null)[] = [];

      await runAtomic(async (ctx) => {
        found = [
          await repository.findActiveByIdTx(ctx, 'w1', 'u1'),
          await repository.findActiveByIdTx(ctx, 'w2', 'u1'),
          await repository.findActiveByIdTx(ctx, 'w1', 'u2'),
          await repository.findActiveByIdTx(ctx, 'missing', 'u1'),
        ];
      });

      expect(found[0]?.toPersistence()).toEqual(
        wallet({ balance: 100 }).toPersistence(),
      );
      expect(found.slice(1)).toEqual([null, null, null]);
    });

    it('[CDC-02] findLatestSettlementTx inside the atomic run returns the SETTLEMENT of the owner with the newest createdAt whatever the id order, and null for a leaf without SETTLEMENT', async () => {
      const repository = makeRepository();
      const newestA = settlement('a1', 'leaf-a', '2026-06-12T10:00:00.000Z');
      const newestB = settlement('b2', 'leaf-b', '2026-06-14T10:00:00.000Z');
      const reversal = WalletMovementRefTypeEnum.SETTLEMENT_REVERSAL;
      await repository.create(wallet(), [
        newestA,
        settlement('a2', 'leaf-a', '2026-06-11T10:00:00.000Z'),
        settlement('a0', 'leaf-a', '2026-06-20T10:00:00.000Z', 'u2'),
        settlement('b1', 'leaf-b', '2026-06-13T10:00:00.000Z'),
        newestB,
        settlement('c1', 'leaf-c', '2026-06-15T10:00:00.000Z', 'u1', reversal),
      ]);
      let latest: (WalletMovement | null)[] = [];

      await runAtomic(async (ctx) => {
        latest = [
          await repository.findLatestSettlementTx(ctx, 'leaf-a', 'u1'),
          await repository.findLatestSettlementTx(ctx, 'leaf-b', 'u1'),
          await repository.findLatestSettlementTx(ctx, 'leaf-c', 'u1'),
        ];
      });

      expect(latest[0]?.toPersistence()).toEqual(newestA.toPersistence());
      expect(latest[1]?.toPersistence()).toEqual(newestB.toPersistence());
      expect(latest[2]).toBeNull();
    });
  },
);

describe('WalletRepositoryFirestore atomic run', () => {
  it('[BK3-09] a work that throws after saveWithMovementsTx inside AtomicRunner.run leaves no wallet and no movement', async () => {
    const repository = WalletRepositoryFirestore.create(db);
    const failure = new Error();

    await expect(
      AtomicRunner.create(db).run(async (ctx) => {
        await repository.saveWithMovementsTx(ctx, wallet({ balance: 100 }), [
          movement({ amount: 100 }),
        ]);
        throw failure;
      }),
    ).rejects.toBe(failure);

    expect(await repository.findById('w1', 'u1')).toBeNull();
    expect(await repository.listMovements('w1', 'u1')).toEqual([]);
  });

  const brokenMovement = () =>
    WalletMovement.with({
      ...movement({ id: 'm2' }).toPersistence(),
      occurredAt: undefined as unknown as string,
    });

  it('[BK3-09] a movement with an undefined field makes saveWithMovements reject and leaves no wallet and no movement (rollback)', async () => {
    const repository = WalletRepositoryFirestore.create(db);

    await expect(
      repository.saveWithMovements(wallet({ balance: 100 }), [
        movement(),
        brokenMovement(),
      ]),
    ).rejects.toThrow();

    expect(await repository.findById('w1', 'u1')).toBeNull();
    expect(await repository.listMovements('w1', 'u1')).toEqual([]);
  });

  it('[BK3-09] a movement with an undefined field makes create reject and leaves no wallet and no movement', async () => {
    const repository = WalletRepositoryFirestore.create(db);

    await expect(
      repository.create(wallet({ balance: 100 }), [
        movement(),
        brokenMovement(),
      ]),
    ).rejects.toThrow();

    expect(await repository.findById('w1', 'u1')).toBeNull();
    expect(await repository.listMovements('w1', 'u1')).toEqual([]);
  });
});
