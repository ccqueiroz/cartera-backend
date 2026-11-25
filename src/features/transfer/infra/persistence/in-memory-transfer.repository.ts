import { Transfer } from '@/features/transfer/domain/transfer.entity';
import {
  ListTransfersFilter,
  TransferRepository,
  TransferTxContext,
} from '@/features/transfer/domain/ports/transfer.repository.port';

/** Repositório em memória para testes de caso de uso (espelha o do wallet). */
export class InMemoryTransferRepository implements TransferRepository {
  private readonly transfers: Transfer[] = [];

  public async saveTx(
    _ctx: TransferTxContext,
    transfer: Transfer,
  ): Promise<void> {
    this.transfers.push(transfer);
  }

  public async listByUser(
    userId: string,
    _filter: ListTransfersFilter,
  ): Promise<Transfer[]> {
    return this.transfers.filter((transfer) => transfer.userId === userId);
  }

  public async findById(id: string, userId: string): Promise<Transfer | null> {
    return (
      this.transfers.find(
        (transfer) => transfer.id === id && transfer.userId === userId,
      ) ?? null
    );
  }
}
