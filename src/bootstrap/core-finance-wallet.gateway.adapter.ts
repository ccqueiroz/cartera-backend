import { Firestore } from 'firebase-admin/firestore';
import { AtomicContext } from '@/shared/database/atomic-runner';
import {
  WalletMovementSpec,
  SettlementMovementRef,
  SettlementWallet,
  WalletGateway,
  WalletTxContext,
} from '@/features/core-finance/shared/ports/wallet.gateway.port';
import { WalletSnapshot } from '@/features/core-finance/shared/domain/wallet-snapshot';
import { WalletRepository } from '@/features/wallet/domain/ports/wallet.repository.port';
import { Wallet } from '@/features/wallet/domain/wallet.entity';
import { WalletMovement } from '@/features/wallet/domain/wallet-movement.entity';
import { Money } from '@/shared/kernel/value-objects/money.vo';

type WalletsInternal = Pick<
  WalletRepository,
  'findActiveByIdTx' | 'findLatestSettlementTx' | 'saveWithMovementsTx'
>;

interface OverdraftRecord {
  limit: number;
  monthlyRate: number;
  graceDays: number;
  since: string | null;
}

interface WalletRecord {
  userId: string;
  balance: number;
  overdraft: OverdraftRecord | null;
  deletedAt: string | null;
  [key: string]: unknown;
}

interface MovementRecord {
  walletId: string;
  amount: number;
}

/**
 * Mora no bootstrap: core-finance e wallet não se importam — só o composition
 * root conhece os dois lados. Lê snapshot/movimento fora da
 * transação e escreve (saldo + `WalletMovement`) dentro do `ctx` do AtomicRunner,
 * depois das leituras transacionais do motor (reads-before-writes). Serve as duas
 * direções (despesa debita / receita credita) sem ramo por tipo.
 */
export class CoreFinanceWalletGatewayAdapter implements WalletGateway {
  private static readonly WALLETS = 'Wallet';
  private static readonly MOVEMENTS = 'WalletMovement';

  private constructor(
    private readonly db: Firestore,
    private readonly walletsInternal: WalletsInternal,
  ) {}

  public static create(
    db: Firestore,
    walletsInternal: WalletsInternal,
  ): CoreFinanceWalletGatewayAdapter {
    return new CoreFinanceWalletGatewayAdapter(db, walletsInternal);
  }

  public async findActiveSnapshot(
    walletId: string,
    userId: string,
  ): Promise<WalletSnapshot | null> {
    const doc = await this.db
      .collection(CoreFinanceWalletGatewayAdapter.WALLETS)
      .doc(walletId)
      .get();
    if (!doc.exists) return null;
    const data = doc.data() as WalletRecord;
    if (data.userId !== userId || data.deletedAt !== null) return null;
    return WalletSnapshot.fromRaw(walletId, data);
  }

  public async findSettlementMovement(
    leafId: string,
    userId: string,
  ): Promise<SettlementMovementRef | null> {
    const snap = await this.db
      .collection(CoreFinanceWalletGatewayAdapter.MOVEMENTS)
      .where('userId', '==', userId)
      .where('refId', '==', leafId)
      .where('refType', '==', 'SETTLEMENT')
      .limit(1)
      .get();
    if (snap.empty) return null;
    const data = snap.docs[0].data() as MovementRecord;
    return { walletId: data.walletId, amount: data.amount };
  }

  public async persistSettlement(
    ctx: AtomicContext,
    snapshot: WalletSnapshot,
    movements: WalletMovementSpec[],
  ): Promise<void> {
    const updatedAt = movements[0]?.createdAt ?? '';
    ctx.txn.set(
      this.db
        .collection(CoreFinanceWalletGatewayAdapter.WALLETS)
        .doc(snapshot.id),
      snapshot.toPersistence(updatedAt),
    );
    for (const movement of movements)
      ctx.txn.set(
        this.db
          .collection(CoreFinanceWalletGatewayAdapter.MOVEMENTS)
          .doc(movement.id),
        { ...movement },
      );
  }

  public async loadWalletTx(
    ctx: WalletTxContext,
    walletId: string,
    userId: string,
  ): Promise<SettlementWallet | null> {
    return this.walletsInternal.findActiveByIdTx(ctx, walletId, userId);
  }

  public async findLatestSettlementTx(
    ctx: WalletTxContext,
    leafId: string,
    userId: string,
  ): Promise<SettlementMovementRef | null> {
    const movement = await this.walletsInternal.findLatestSettlementTx(
      ctx,
      leafId,
      userId,
    );
    if (!movement) return null;
    const { walletId, amount } = movement.toPersistence();
    return { walletId, amount };
  }

  public async saveWalletTx(
    ctx: WalletTxContext,
    wallet: SettlementWallet,
    movements: WalletMovementSpec[],
  ): Promise<void> {
    await this.walletsInternal.saveWithMovementsTx(
      ctx,
      wallet as Wallet,
      movements.map((spec) =>
        WalletMovement.create({ ...spec, amount: Money.create(spec.amount) }),
      ),
    );
  }
}
