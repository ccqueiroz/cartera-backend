import { Firestore } from 'firebase-admin/firestore';
import { WalletGateway } from '@/features/transfer/domain/ports/wallet.gateway.port';
import { TransferWalletSnapshot } from '@/features/transfer/domain/transfer-wallet-snapshot';

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

  private constructor(private readonly db: Firestore) {}

  public static create(db: Firestore): TransferWalletGatewayAdapter {
    return new TransferWalletGatewayAdapter(db);
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
}
