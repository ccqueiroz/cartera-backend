import { WalletRepositoryFirestore } from '@/features/wallet/infra/persistence/wallet.repository.firestore';
import { Wallet } from '@/features/wallet/domain/wallet.entity';
import { WalletMovement } from '@/features/wallet/domain/wallet-movement.entity';
import {
  WalletMovementDirectionEnum,
  WalletMovementRefTypeEnum,
} from '@/features/wallet/domain/enums/wallet-movement.enums';
import { Money } from '@/shared/kernel/value-objects/money.vo';

function makeDb() {
  const store: Record<string, Map<string, any>> = {};
  const col = (name: string) => (store[name] ??= new Map());

  const docRef = (name: string, id: string) => ({
    __col: name,
    __id: id,
    get: async () => {
      const data = col(name).get(id);
      return { exists: data !== undefined, data: () => data };
    },
    set: async (data: any) => {
      col(name).set(id, data);
    },
  });

  const makeQuery = (
    name: string,
    preds: [string, unknown][],
    lim?: number,
  ) => ({
    where: (field: string, _op: string, value: unknown) =>
      makeQuery(name, [...preds, [field, value]], lim),
    limit: (n: number) => makeQuery(name, preds, n),
    get: async () => {
      let rows = [...col(name).values()].filter((doc) =>
        preds.every(([field, value]) => doc[field] === value),
      );
      if (lim !== undefined) rows = rows.slice(0, lim);
      return {
        empty: rows.length === 0,
        docs: rows.map((d) => ({ data: () => d })),
      };
    },
  });

  const collection = (name: string) => ({
    doc: (id: string) => docRef(name, id),
    where: (field: string, _op: string, value: unknown) =>
      makeQuery(name, [[field, value]]),
  });

  const runTransaction = jest.fn(async (fn: any) => {
    const txn = {
      set: (ref: any, data: any) => {
        col(ref.__col).set(ref.__id, data);
      },
    };
    return fn(txn);
  });

  const batch = jest.fn(() => {
    const ops: [any, any][] = [];
    return {
      set: (ref: any, data: any) => {
        ops.push([ref, data]);
      },
      commit: async () => {
        ops.forEach(([ref, data]) => col(ref.__col).set(ref.__id, data));
      },
    };
  });

  const db = { collection: jest.fn(collection), runTransaction, batch } as any;
  return { db, store, runTransaction, batch };
}

const signedDelta = (m: WalletMovement): number =>
  (m.direction === WalletMovementDirectionEnum.CREDIT ? 1 : -1) *
  m.amount.value;

function wallet(
  overrides: Partial<{ id: string; userId: string; balance: number }> = {},
) {
  return Wallet.create({
    id: overrides.id ?? 'w1',
    userId: overrides.userId ?? 'u1',
    name: 'Cartera',
    balance: overrides.balance ?? 0,
    createdAt: '2026-06-01T00:00:00.000Z',
  });
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

describe('WalletRepositoryFirestore', () => {
  it('saveWithMovements grava saldo + movimentos numa única runTransaction (atômico)', async () => {
    const { db, store, runTransaction, batch } = makeDb();
    const repo = WalletRepositoryFirestore.create(db);
    const w = wallet({ balance: -50 });
    const movements = [
      movement({
        id: 'm1',
        direction: WalletMovementDirectionEnum.DEBIT,
        amount: 50,
      }),
      movement({
        id: 'm2',
        direction: WalletMovementDirectionEnum.DEBIT,
        amount: 0.01,
      }),
    ];

    await repo.saveWithMovements(w, movements);

    expect(runTransaction).toHaveBeenCalledTimes(1);
    expect(batch).not.toHaveBeenCalled();
    expect(store['Wallet'].get('w1')).toBeDefined();
    expect(store['WalletMovement'].get('m1')).toBeDefined();
    expect(store['WalletMovement'].get('m2')).toBeDefined();
  });

  it('create grava a carteira + movimento de abertura num batch', async () => {
    const { db, store, batch } = makeDb();
    const repo = WalletRepositoryFirestore.create(db);

    await repo.create(wallet({ balance: 100 }), [movement({ amount: 100 })]);

    expect(batch).toHaveBeenCalledTimes(1);
    expect(store['Wallet'].get('w1')).toBeDefined();
    expect(store['WalletMovement'].get('m1')).toBeDefined();
  });

  it('reconcilia Σ dos movimentos persistidos com o saldo gravado', async () => {
    const { db } = makeDb();
    const repo = WalletRepositoryFirestore.create(db);
    const movements = [
      movement({
        id: 'm1',
        direction: WalletMovementDirectionEnum.CREDIT,
        amount: 100,
      }),
      movement({
        id: 'm2',
        direction: WalletMovementDirectionEnum.DEBIT,
        amount: 30,
      }),
    ];
    await repo.saveWithMovements(wallet({ balance: 70 }), movements);

    const stored = await repo.findById('w1', 'u1');
    const ledger = await repo.listMovements('w1', 'u1');
    const sum = ledger.reduce((acc, m) => acc + signedDelta(m), 0);

    expect(Number(sum.toFixed(2))).toBe(70);
    expect(stored?.balance.value).toBe(70);
  });

  it('isola por userId: findById de outro dono retorna null', async () => {
    const { db } = makeDb();
    const repo = WalletRepositoryFirestore.create(db);
    await repo.create(wallet({ userId: 'u1' }), [movement()]);

    expect(await repo.findById('w1', 'u2')).toBeNull();
    expect(await repo.findById('w1', 'u1')).not.toBeNull();
  });

  it('findActiveById ignora carteira deletada e dono estrangeiro', async () => {
    const { db, store } = makeDb();
    const repo = WalletRepositoryFirestore.create(db);
    await repo.create(wallet({ userId: 'u1' }), [movement()]);
    const persisted = store['Wallet'].get('w1');

    expect(await repo.findActiveById('w1', 'u1')).not.toBeNull();

    store['Wallet'].set('w1', {
      ...persisted,
      deletedAt: '2026-06-15T00:00:00.000Z',
    });
    expect(await repo.findActiveById('w1', 'u1')).toBeNull();
    expect(await repo.findActiveById('w1', 'u2')).toBeNull();
  });

  it('listMovements filtra por walletId+userId e ordena por occurredAt asc', async () => {
    const { db } = makeDb();
    const repo = WalletRepositoryFirestore.create(db);
    await repo.saveWithMovements(wallet(), [
      movement({ id: 'm1', occurredAt: '2026-06-12' }),
      movement({ id: 'm2', occurredAt: '2026-06-10' }),
      movement({ id: 'm3', occurredAt: '2026-06-11' }),
      movement({ id: 'foreign', userId: 'u2', occurredAt: '2026-06-09' }),
      movement({
        id: 'other-wallet',
        walletId: 'w2',
        occurredAt: '2026-06-08',
      }),
    ]);

    const ledger = await repo.listMovements('w1', 'u1');

    expect(ledger.map((m) => m.id)).toEqual(['m2', 'm3', 'm1']);
  });
});
