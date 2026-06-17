import { TransferWalletSnapshot } from '@/features/transfer/domain/transfer-wallet-snapshot';

/** Porta que a transferência usa para carregar uma carteira ativa do dono. */
export interface WalletGateway {
  findActiveById(
    walletId: string,
    userId: string,
  ): Promise<TransferWalletSnapshot | null>;
}
