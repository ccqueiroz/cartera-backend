import { TransferRepositoryFirestore } from './transfer.repository.firestore';
import { Transfer } from '@/features/transfer/domain/transfer.entity';
import { TransferWalletSnapshot } from '@/features/transfer/domain/transfer-wallet-snapshot';
import { TransferMovement } from '@/features/transfer/domain/transfer-movement';
import { Money } from '@/shared/kernel/value-objects/money.vo';

function makeDb(failOnMovement = false) {
  const store: Record<string, Map<string, any>> = {};
  const col = (name: string) => (store[name] ??= new Map());

  const docRef = (name: string, id: string) => ({
    __col: name,
    __id: id,
    get: async () => {
      const data = col(name).get(id);
      return { exists: data !== undefined, data: () => data };
    },
  });

  const makeQuery = (name: string, preds: [string, unknown][]) => ({
    where: (field: string, _op: string, value: unknown) =>
      makeQuery(name, [...preds, [field, value]]),
    get: async () => {
      const rows = [...col(name).values()].filter((doc) =>
        preds.every(([field, value]) => doc[field] === value),
      );
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

  // Buffer das escritas e só aplica no fim (atômico). Se algo lançar no meio,
  // nada é aplicado — modela o rollback do runTransaction.
  const runTransaction = jest.fn(async (fn: any) => {
    const pending: [any, any][] = [];
    const txn = {
      set: (ref: any, data: any) => {
        if (failOnMovement && ref.__col === 'WalletMovement')
          throw new Error('boom no movimento');
        pending.push([ref, data]);
      },
    };
    await fn(txn);
    pending.forEach(([ref, data]) => col(ref.__col).set(ref.__id, data));
  });

  const db = { collection: jest.fn(collection), runTransaction } as any;
  return { db, store, runTransaction };
}

function snapshot(balance: number): TransferWalletSnapshot {
  return TransferWalletSnapshot.fromRaw({
    userId: 'u1',
    name: 'W',
    balance,
    overdraft: null,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: null,
    deletedAt: null,
  });
}

function transfer(userId = 'u1'): Transfer {
  return Transfer.create({
    id: 't1',
    userId,
    fromWalletId: 'w1',
    toWalletId: 'w2',
    amount: Money.create(100),
    paymentMethodDescriptionEnum: 'PIX',
    transferDate: '2026-06-10',
    createdAt: '2026-06-17T10:00:00.000Z',
  });
}

function movements(): TransferMovement[] {
  return [
    {
      id: 'm1',
      userId: 'u1',
      walletId: 'w1',
      direction: 'DEBIT',
      amount: 100,
      refType: 'TRANSFER',
      refId: 't1',
      occurredAt: '2026-06-10',
      createdAt: '2026-06-17T10:00:00.000Z',
    },
    {
      id: 'm2',
      userId: 'u1',
      walletId: 'w2',
      direction: 'CREDIT',
      amount: 100,
      refType: 'TRANSFER',
      refId: 't1',
      occurredAt: '2026-06-10',
      createdAt: '2026-06-17T10:00:00.000Z',
    },
  ];
}

describe('TransferRepositoryFirestore', () => {
  it('saveTransfer grava os 5 efeitos numa única runTransaction', async () => {
    const { db, store, runTransaction } = makeDb();
    const repo = TransferRepositoryFirestore.create(db);

    await repo.saveTransfer(
      snapshot(200),
      snapshot(50),
      movements(),
      transfer(),
    );

    expect(runTransaction).toHaveBeenCalledTimes(1);
    expect(store['Wallet'].get('w1')).toBeDefined();
    expect(store['Wallet'].get('w2')).toBeDefined();
    expect(store['Wallet'].get('w1').balance).toBe(200);
    expect(store['WalletMovement'].get('m1')).toBeDefined();
    expect(store['WalletMovement'].get('m2')).toBeDefined();
    expect(store['Transfer'].get('t1')).toBeDefined();
    expect(store['Transfer'].get('t1').amount).toBe(100);
  });

  it('falha na transação não deixa efeito parcial (rollback)', async () => {
    const { db, store } = makeDb(true);
    const repo = TransferRepositoryFirestore.create(db);

    await expect(
      repo.saveTransfer(snapshot(200), snapshot(50), movements(), transfer()),
    ).rejects.toThrow();

    expect(store['Wallet']?.get('w1')).toBeUndefined();
    expect(store['Wallet']?.get('w2')).toBeUndefined();
    expect(store['WalletMovement']?.get('m1')).toBeUndefined();
    expect(store['Transfer']?.get('t1')).toBeUndefined();
  });

  it('findById isola por userId', async () => {
    const { db } = makeDb();
    const repo = TransferRepositoryFirestore.create(db);
    await repo.saveTransfer(
      snapshot(200),
      snapshot(50),
      movements(),
      transfer('u1'),
    );

    expect(await repo.findById('t1', 'u2')).toBeNull();
    expect(await repo.findById('t1', 'u1')).not.toBeNull();
  });

  it('listByUser devolve só as transferências do dono', async () => {
    const { db } = makeDb();
    const repo = TransferRepositoryFirestore.create(db);
    await repo.saveTransfer(
      snapshot(200),
      snapshot(50),
      movements(),
      transfer('u1'),
    );

    const mine = await repo.listByUser('u1', {});
    const others = await repo.listByUser('u2', {});

    expect(mine).toHaveLength(1);
    expect(others).toHaveLength(0);
  });
});
