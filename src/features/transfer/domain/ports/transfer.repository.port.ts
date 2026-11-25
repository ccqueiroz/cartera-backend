import { Transfer } from '@/features/transfer/domain/transfer.entity';
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
  /** Grava só o `Transfer`, na transação do ctx: as carteiras e os movimentos vão pela porta de carteira. */
  saveTx(ctx: TransferTxContext, transfer: Transfer): Promise<void>;
  listByUser(userId: string, filter: ListTransfersFilter): Promise<Transfer[]>;
  findById(id: string, userId: string): Promise<Transfer | null>;
}
