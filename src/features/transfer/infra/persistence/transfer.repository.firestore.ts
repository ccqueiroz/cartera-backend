import { Firestore } from 'firebase-admin/firestore';
import {
  Transfer,
  TransferPersistence,
} from '@/features/transfer/domain/transfer.entity';
import { TransferWalletSnapshot } from '@/features/transfer/domain/transfer-wallet-snapshot';
import { TransferMovement } from '@/features/transfer/domain/transfer-movement';
import {
  ListTransfersFilter,
  TransferRepository,
} from '@/features/transfer/domain/ports/transfer.repository.port';

/**
 * Transferência imutável na coleção `Transfer`. `saveTransfer` grava os cinco
 * efeitos (2 carteiras em `Wallet`, 2 movimentos em `WalletMovement`, 1
 * transferência em `Transfer`) numa única `runTransaction` — tudo-ou-nada (D2).
 */
export class TransferRepositoryFirestore implements TransferRepository {
  private static readonly TRANSFERS = 'Transfer';
  private static readonly WALLETS = 'Wallet';
  private static readonly MOVEMENTS = 'WalletMovement';

  private constructor(private readonly db: Firestore) {}

  public static create(db: Firestore): TransferRepositoryFirestore {
    return new TransferRepositoryFirestore(db);
  }

  public async saveTransfer(
    fromWallet: TransferWalletSnapshot,
    toWallet: TransferWalletSnapshot,
    movements: TransferMovement[],
    transfer: Transfer,
  ): Promise<void> {
    const updatedAt = transfer.toPersistence().createdAt;
    await this.db.runTransaction(async (txn) => {
      txn.set(
        this.wallets().doc(transfer.fromWalletId),
        fromWallet.toPersistence(updatedAt),
      );
      txn.set(
        this.wallets().doc(transfer.toWalletId),
        toWallet.toPersistence(updatedAt),
      );
      for (const movement of movements)
        txn.set(this.movements().doc(movement.id), movement);
      txn.set(this.transfers().doc(transfer.id), transfer.toPersistence());
    });
  }

  public async listByUser(
    userId: string,
    _filter: ListTransfersFilter,
  ): Promise<Transfer[]> {
    const query = await this.transfers().where('userId', '==', userId).get();
    return query.docs.map((doc) =>
      Transfer.with(doc.data() as TransferPersistence),
    );
  }

  public async findById(id: string, userId: string): Promise<Transfer | null> {
    const doc = await this.transfers().doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data() as TransferPersistence;
    if (data.userId !== userId) return null;
    return Transfer.with(data);
  }

  private transfers() {
    return this.db.collection(TransferRepositoryFirestore.TRANSFERS);
  }

  private wallets() {
    return this.db.collection(TransferRepositoryFirestore.WALLETS);
  }

  private movements() {
    return this.db.collection(TransferRepositoryFirestore.MOVEMENTS);
  }
}
