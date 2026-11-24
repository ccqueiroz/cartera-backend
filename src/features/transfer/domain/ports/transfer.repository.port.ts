import { Transfer } from '@/features/transfer/domain/transfer.entity';
import { TransferWalletSnapshot } from '@/features/transfer/domain/transfer-wallet-snapshot';
import { TransferMovement } from '@/features/transfer/domain/transfer-movement';
import { AtomicContext } from '@/shared/database/atomic-runner';

/** A porta de carteira e o adaptador do bootstrap tipam o ctx por aqui, sem importar `src/shared/database/`. */
export type TransferTxContext = AtomicContext;

export interface ListTransfersFilter {
  month?: number;
  year?: number;
  page?: number;
  size?: number;
}

export interface TransferRepository {
  /**
   * Escrita atômica dos cinco efeitos (W4/ADR-05/D2): grava as duas carteiras
   * (saldo debitado/creditado), os dois movimentos e a transferência numa única
   * `runTransaction` — tudo-ou-nada.
   */
  saveTransfer(
    fromWallet: TransferWalletSnapshot,
    toWallet: TransferWalletSnapshot,
    movements: TransferMovement[],
    transfer: Transfer,
  ): Promise<void>;
  /** Grava só o `Transfer`, na transação do ctx: as carteiras e os movimentos vão pela porta de carteira. */
  saveTx(ctx: TransferTxContext, transfer: Transfer): Promise<void>;
  listByUser(userId: string, filter: ListTransfersFilter): Promise<Transfer[]>;
  findById(id: string, userId: string): Promise<Transfer | null>;
}
