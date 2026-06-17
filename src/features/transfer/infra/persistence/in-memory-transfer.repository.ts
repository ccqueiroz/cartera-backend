import { Transfer } from '@/features/transfer/domain/transfer.entity';
import { TransferWalletSnapshot } from '@/features/transfer/domain/transfer-wallet-snapshot';
import { TransferMovement } from '@/features/transfer/domain/transfer-movement';
import {
  ListTransfersFilter,
  TransferRepository,
} from '@/features/transfer/domain/ports/transfer.repository.port';

/** Repositório em memória para testes de caso de uso (espelha o do wallet). */
export class InMemoryTransferRepository implements TransferRepository {
  private readonly transfers: Transfer[] = [];
  public readonly savedWallets: TransferWalletSnapshot[] = [];
  public readonly savedMovements: TransferMovement[] = [];

  public async saveTransfer(
    fromWallet: TransferWalletSnapshot,
    toWallet: TransferWalletSnapshot,
    movements: TransferMovement[],
    transfer: Transfer,
  ): Promise<void> {
    this.savedWallets.push(fromWallet, toWallet);
    this.savedMovements.push(...movements);
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
