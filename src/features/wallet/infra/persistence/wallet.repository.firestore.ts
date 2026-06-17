import { Firestore } from 'firebase-admin/firestore';
import {
  Wallet,
  WalletPersistence,
} from '@/features/wallet/domain/wallet.entity';
import {
  WalletMovement,
  WalletMovementPersistence,
} from '@/features/wallet/domain/wallet-movement.entity';
import { WalletRepository } from '@/features/wallet/domain/ports/wallet.repository.port';

/**
 * Wallet (`Wallet`) e ledger (`WalletMovement`) em coleções separadas. Toda
 * mutação de saldo grava saldo + movimentos numa `runTransaction` (W4/ADR-05):
 * saldo e extrato nunca divergem.
 */
export class WalletRepositoryFirestore implements WalletRepository {
  private static readonly WALLETS = 'Wallet';
  private static readonly MOVEMENTS = 'WalletMovement';

  private constructor(private readonly db: Firestore) {}

  public static create(db: Firestore): WalletRepositoryFirestore {
    return new WalletRepositoryFirestore(db);
  }

  public async findActiveById(
    id: string,
    userId: string,
  ): Promise<Wallet | null> {
    const doc = await this.wallets().doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data() as WalletPersistence;
    if (data.userId !== userId || data.deletedAt !== null) return null;
    return Wallet.with(data);
  }

  public async findById(id: string, userId: string): Promise<Wallet | null> {
    const doc = await this.wallets().doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data() as WalletPersistence;
    if (data.userId !== userId) return null;
    return Wallet.with(data);
  }

  public async listActiveByUser(userId: string): Promise<Wallet[]> {
    const query = await this.wallets()
      .where('userId', '==', userId)
      .where('deletedAt', '==', null)
      .get();
    return query.docs.map((doc) =>
      Wallet.with(doc.data() as WalletPersistence),
    );
  }

  public async findDefaultByUser(
    userId: string,
    name: string,
  ): Promise<Wallet | null> {
    const query = await this.wallets()
      .where('userId', '==', userId)
      .where('name', '==', name)
      .where('deletedAt', '==', null)
      .limit(1)
      .get();
    if (query.empty) return null;
    return Wallet.with(query.docs[0].data() as WalletPersistence);
  }

  public async create(
    wallet: Wallet,
    movements: WalletMovement[],
  ): Promise<void> {
    const batch = this.db.batch();
    batch.set(this.wallets().doc(wallet.id), wallet.toPersistence());
    for (const movement of movements)
      batch.set(this.movements().doc(movement.id), movement.toPersistence());
    await batch.commit();
  }

  public async saveWithMovements(
    wallet: Wallet,
    movements: WalletMovement[],
  ): Promise<void> {
    await this.db.runTransaction(async (txn) => {
      txn.set(this.wallets().doc(wallet.id), wallet.toPersistence());
      for (const movement of movements)
        txn.set(this.movements().doc(movement.id), movement.toPersistence());
    });
  }

  public async update(wallet: Wallet): Promise<void> {
    await this.wallets().doc(wallet.id).set(wallet.toPersistence());
  }

  public async listMovements(
    walletId: string,
    userId: string,
  ): Promise<WalletMovement[]> {
    const query = await this.movements()
      .where('walletId', '==', walletId)
      .where('userId', '==', userId)
      .get();
    return query.docs
      .map((doc) =>
        WalletMovement.with(doc.data() as WalletMovementPersistence),
      )
      .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  }

  private wallets() {
    return this.db.collection(WalletRepositoryFirestore.WALLETS);
  }

  private movements() {
    return this.db.collection(WalletRepositoryFirestore.MOVEMENTS);
  }
}
