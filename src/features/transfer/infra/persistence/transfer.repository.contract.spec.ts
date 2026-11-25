import { Firestore } from 'firebase-admin/firestore';
import { Transfer } from '@/features/transfer/domain/transfer.entity';
import { TransferRepository } from '@/features/transfer/domain/ports/transfer.repository.port';
import { InMemoryTransferRepository } from '@/features/transfer/infra/persistence/in-memory-transfer.repository';
import { TransferRepositoryFirestore } from '@/features/transfer/infra/persistence/transfer.repository.firestore';
import { Money } from '@/shared/kernel/value-objects/money.vo';
import { AtomicRunner } from '@/shared/database/atomic-runner';
import { firestoreEmulator } from '@/test/support/firestore-emulator';

jest.setTimeout(60_000);

let db: Firestore;

beforeAll(async () => {
  db = await firestoreEmulator.connect();
});
beforeEach(() => firestoreEmulator.clear());
afterAll(() => db.terminate());

const CREATED_AT = '2026-06-17T10:00:00.000Z';

function transfer(id = 't1', userId = 'u1'): Transfer {
  return Transfer.create({
    id,
    userId,
    fromWalletId: 'w1',
    toWalletId: 'w2',
    amount: Money.create(100),
    paymentMethodDescriptionEnum: 'PIX',
    transferDate: '2026-06-10',
    createdAt: CREATED_AT,
  });
}

function save(repository: TransferRepository, saved: Transfer): Promise<void> {
  return AtomicRunner.create(db).run((ctx) => repository.saveTx(ctx, saved));
}

const ids = (items: { id: string }[]) => items.map((item) => item.id).sort();

const adapters: [string, () => TransferRepository][] = [
  ['in-memory', () => new InMemoryTransferRepository()],
  ['firestore (emulator)', () => TransferRepositoryFirestore.create(db)],
];

describe.each(adapters)(
  'TransferRepository contract - %s',
  (_name, makeRepository) => {
    it('[BK3-10] saveTx then findById returns the transfer to the owner, and null for another owner and for a missing id', async () => {
      const repository = makeRepository();
      await save(repository, transfer());

      expect((await repository.findById('t1', 'u1'))?.toPersistence()).toEqual(
        transfer().toPersistence(),
      );
      expect(await repository.findById('t1', 'u2')).toBeNull();
      expect(await repository.findById('missing', 'u1')).toBeNull();
    });

    it('[BK3-10] listByUser returns only the transfers of the owner', async () => {
      const repository = makeRepository();
      await save(repository, transfer('t2'));
      await save(repository, transfer('t1'));
      await save(repository, transfer('t3', 'u2'));

      expect(ids(await repository.listByUser('u1', {}))).toEqual(['t1', 't2']);
    });

    it('[CDC-11] saveTx inside the atomic run then findById returns the transfer to the owner', async () => {
      const repository = makeRepository();
      await AtomicRunner.create(db).run((ctx) =>
        repository.saveTx(ctx, transfer()),
      );

      expect((await repository.findById('t1', 'u1'))?.toPersistence()).toEqual(
        transfer().toPersistence(),
      );
    });
  },
);

describe('TransferRepositoryFirestore atomic write', () => {
  it('[CDC-11] a work that throws after saveTx inside AtomicRunner.run leaves no transfer, while a saveTx run that commits keeps its own', async () => {
    const repository = TransferRepositoryFirestore.create(db);
    const runner = AtomicRunner.create(db);
    const failure = new Error();

    await runner.run((ctx) => repository.saveTx(ctx, transfer('t2')));
    await expect(
      runner.run(async (ctx) => {
        await repository.saveTx(ctx, transfer());
        throw failure;
      }),
    ).rejects.toBe(failure);

    expect((await repository.findById('t2', 'u1'))?.id).toBe('t2');
    expect(await repository.findById('t1', 'u1')).toBeNull();
  });
});
