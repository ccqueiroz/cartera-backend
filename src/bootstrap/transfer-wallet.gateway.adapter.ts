import { Firestore } from 'firebase-admin/firestore';
import {
  TransferWallet,
  WalletGateway,
} from '@/features/transfer/domain/ports/wallet.gateway.port';
import { TransferTxContext } from '@/features/transfer/domain/ports/transfer.repository.port';
import { TransferMovement } from '@/features/transfer/domain/transfer-movement';
import { TransferWalletSnapshot } from '@/features/transfer/domain/transfer-wallet-snapshot';
import { WalletRepository } from '@/features/wallet/domain/ports/wallet.repository.port';
import { Wallet } from '@/features/wallet/domain/wallet.entity';
import { WalletMovement } from '@/features/wallet/domain/wallet-movement.entity';
import { Money } from '@/shared/kernel/value-objects/money.vo';

type WalletsInternal = Pick<
  WalletRepository,
  'findActiveByIdTx' | 'saveWithMovementsTx'
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

/**
 * Mora no bootstrap: transfer e wallet não se importam — só o composition root
 * conhece os dois lados. Lê a carteira ativa do dono na coleção `Wallet` e a
 * devolve como snapshot puro (registro cru completo, para a escrita atômica
 * round-trip preservar todos os campos da carteira).
 */
export class TransferWalletGatewayAdapter implements WalletGateway {
  private static readonly WALLETS = 'Wallet';

  private constructor(
    private readonly db: Firestore,
    private readonly walletsInternal: WalletsInternal,
  ) {}

  public static create(
    db: Firestore,
    walletsInternal: WalletsInternal,
  ): TransferWalletGatewayAdapter {
    return new TransferWalletGatewayAdapter(db, walletsInternal);
  }

  public async findActiveById(
    walletId: string,
    userId: string,
  ): Promise<TransferWalletSnapshot | null> {
    const doc = await this.db
      .collection(TransferWalletGatewayAdapter.WALLETS)
      .doc(walletId)
      .get();
    if (!doc.exists) return null;
    const data = doc.data() as WalletRecord;
    if (data.userId !== userId || data.deletedAt !== null) return null;
    return TransferWalletSnapshot.fromRaw(data);
  }

  public async loadWalletTx(
    ctx: TransferTxContext,
    walletId: string,
    userId: string,
  ): Promise<TransferWallet | null> {
    return this.walletsInternal.findActiveByIdTx(ctx, walletId, userId);
  }

  public async saveWalletTx(
    ctx: TransferTxContext,
    wallet: TransferWallet,
    movements: TransferMovement[],
  ): Promise<void> {
    await this.walletsInternal.saveWithMovementsTx(
      ctx,
      wallet as Wallet,
      movements.map((movement) =>
        WalletMovement.create({
          ...movement,
          amount: Money.create(movement.amount),
        }),
      ),
    );
  }
}
