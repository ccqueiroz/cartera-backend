import { Firestore } from 'firebase-admin/firestore';
import { Transfer } from '@/features/transfer/domain/transfer.entity';
import { TransferMovement } from '@/features/transfer/domain/transfer-movement';
import { TransferWalletSnapshot } from '@/features/transfer/domain/transfer-wallet-snapshot';
import { TransferRepository } from '@/features/transfer/domain/ports/transfer.repository.port';
import { InMemoryTransferRepository } from '@/features/transfer/infra/persistence/in-memory-transfer.repository';
import { TransferRepositoryFirestore } from '@/features/transfer/infra/persistence/transfer.repository.firestore';
import { Money } from '@/shared/kernel/value-objects/money.vo';
import { firestoreEmulator } from '@/test/support/firestore-emulator';

jest.setTimeout(60_000);

let db: Firestore;

beforeAll(async () => {
  db = await firestoreEmulator.connect();
});
beforeEach(() => firestoreEmulator.clear());
afterAll(() => db.terminate());

const CREATED_AT = '2026-06-17T10:00:00.000Z';

function walletRaw(balance: number) {
  return {
    userId: 'u1',
    name: 'W',
    balance,
    overdraft: null,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: null,
    deletedAt: null,
  };
}

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

function movements(): TransferMovement[] {
  const movement = (
    id: string,
    walletId: string,
    direction: TransferMovement['direction'],
  ): TransferMovement => ({
    id,
    userId: 'u1',
    walletId,
    direction,
    amount: 100,
    refType: 'TRANSFER',
    refId: 't1',
    occurredAt: '2026-06-10',
    createdAt: CREATED_AT,
  });
  return [movement('m1', 'w1', 'DEBIT'), movement('m2', 'w2', 'CREDIT')];
}

function save(
  repository: TransferRepository,
  saved: Transfer,
  moved: TransferMovement[] = movements(),
): Promise<void> {
  return repository.saveTransfer(
    TransferWalletSnapshot.fromRaw(walletRaw(100)),
    TransferWalletSnapshot.fromRaw(walletRaw(150)),
    moved,
    saved,
  );
}

const ids = (items: { id: string }[]) => items.map((item) => item.id).sort();

const adapters: [string, () => TransferRepository][] = [
  ['in-memory', () => new InMemoryTransferRepository()],
  ['firestore (emulator)', () => TransferRepositoryFirestore.create(db)],
];

describe.each(adapters)(
  'TransferRepository contract - %s',
  (_name, makeRepository) => {
    it('[BK3-10] saveTransfer then findById returns the transfer to the owner, and null for another owner and for a missing id', async () => {
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
  },
);

const fiveDocuments: [string, string][] = [
  ['Wallet', 'w1'],
  ['Wallet', 'w2'],
  ['WalletMovement', 'm1'],
  ['WalletMovement', 'm2'],
  ['Transfer', 't1'],
];

const readFiveDocuments = () =>
  Promise.all(
    fiveDocuments.map(async ([collection, id]) =>
      (await db.collection(collection).doc(id).get()).data(),
    ),
  );

describe('TransferRepositoryFirestore atomic write', () => {
  it('[BK3-10] saveTransfer writes both wallets with the new balance, both movements and the transfer, reread from Wallet, WalletMovement and Transfer', async () => {
    await save(TransferRepositoryFirestore.create(db), transfer());

    expect(await readFiveDocuments()).toEqual([
      { ...walletRaw(100), updatedAt: CREATED_AT },
      { ...walletRaw(150), updatedAt: CREATED_AT },
      ...movements(),
      transfer().toPersistence(),
    ]);
  });

  it('[BK3-10] a movement with an undefined field makes saveTransfer reject and leaves none of the five documents (rollback)', async () => {
    const [debit, credit] = movements();
    const broken = { ...credit, occurredAt: undefined as unknown as string };

    await expect(
      save(TransferRepositoryFirestore.create(db), transfer(), [debit, broken]),
    ).rejects.toThrow();

    expect(await readFiveDocuments()).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
  });
});
