import { Firestore } from 'firebase-admin/firestore';
import {
  Transfer,
  TransferPersistence,
} from '@/features/transfer/domain/transfer.entity';
import {
  ListTransfersFilter,
  TransferRepository,
  TransferTxContext,
} from '@/features/transfer/domain/ports/transfer.repository.port';

/** Transferência imutável na coleção `Transfer`. */
export class TransferRepositoryFirestore implements TransferRepository {
  private static readonly TRANSFERS = 'Transfer';

  private constructor(private readonly db: Firestore) {}

  public static create(db: Firestore): TransferRepositoryFirestore {
    return new TransferRepositoryFirestore(db);
  }

  public async saveTx(
    ctx: TransferTxContext,
    transfer: Transfer,
  ): Promise<void> {
    ctx.txn.set(this.transfers().doc(transfer.id), transfer.toPersistence());
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
}
