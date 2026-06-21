import { Firestore } from 'firebase-admin/firestore';
import { AtomicContext } from '@/shared/database/atomic-runner';
import {
  BillWalletMovementSpec,
  SettlementMovementRef,
  WalletGateway,
} from '@/features/core-finance/bills/domain/ports/wallet.gateway.port';
import { BillWalletSnapshot } from '@/features/core-finance/bills/domain/bill-wallet-snapshot';

interface WalletRecord {
  userId: string;
  balance: number;
  overdraftLimit: number;
  overdraftSince: string | null;
  deletedAt: string | null;
  [key: string]: unknown;
}

interface MovementRecord {
  walletId: string;
  amount: number;
}

/**
 * Mora no bootstrap: bills e wallet não se importam — só o composition root
 * conhece os dois lados (regra §4.3). Lê snapshot/movimento fora da transação e
 * escreve (saldo + `WalletMovement`) dentro do `ctx` do AtomicRunner, depois das
 * leituras transacionais do motor (reads-before-writes).
 */
export class BillsWalletGatewayAdapter implements WalletGateway {
  private static readonly WALLETS = 'Wallet';
  private static readonly MOVEMENTS = 'WalletMovement';

  private constructor(private readonly db: Firestore) {}

  public static create(db: Firestore): BillsWalletGatewayAdapter {
    return new BillsWalletGatewayAdapter(db);
  }

  public async findActiveSnapshot(
    walletId: string,
    userId: string,
  ): Promise<BillWalletSnapshot | null> {
    const doc = await this.db
      .collection(BillsWalletGatewayAdapter.WALLETS)
      .doc(walletId)
      .get();
    if (!doc.exists) return null;
    const data = doc.data() as WalletRecord;
    if (data.userId !== userId || data.deletedAt !== null) return null;
    return BillWalletSnapshot.fromRaw(walletId, data);
  }

  public async findSettlementMovement(
    leafId: string,
    userId: string,
  ): Promise<SettlementMovementRef | null> {
    const snap = await this.db
      .collection(BillsWalletGatewayAdapter.MOVEMENTS)
      .where('userId', '==', userId)
      .where('refId', '==', leafId)
      .where('refType', '==', 'SETTLEMENT')
      .where('direction', '==', 'DEBIT')
      .limit(1)
      .get();
    if (snap.empty) return null;
    const data = snap.docs[0].data() as MovementRecord;
    return { walletId: data.walletId, amount: data.amount };
  }

  public async persistSettlement(
    ctx: AtomicContext,
    snapshot: BillWalletSnapshot,
    movements: BillWalletMovementSpec[],
  ): Promise<void> {
    const updatedAt = movements[0]?.createdAt ?? '';
    ctx.txn.set(
      this.db.collection(BillsWalletGatewayAdapter.WALLETS).doc(snapshot.id),
      snapshot.toPersistence(updatedAt),
    );
    for (const movement of movements)
      ctx.txn.set(
        this.db
          .collection(BillsWalletGatewayAdapter.MOVEMENTS)
          .doc(movement.id),
        { ...movement },
      );
  }
}
