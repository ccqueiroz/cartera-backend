import { TransferMovement } from '@/features/transfer/domain/transfer-movement';
import { TransferTxContext } from '@/features/transfer/domain/ports/transfer.repository.port';
import { Money } from '@/shared/kernel/value-objects/money.vo';
import { SignedMoney } from '@/shared/kernel/value-objects/signed-money.vo';

/**
 * A carteira lida dentro da transação: a entidade `Wallet` da feature wallet a
 * satisfaz por estrutura, sem objeto que a embrulhe, e o transfer não importa a
 * outra feature.
 */
export interface TransferWallet {
  readonly balance: SignedMoney;
  debit(amount: Money, occurredAt: string, updatedAt: string): void;
  credit(amount: Money, updatedAt: string): void;
  exceedsOverdraftLimit(): boolean;
}

/** Porta que a transferência usa para carregar uma carteira ativa do dono. */
export interface WalletGateway {
  /** Lida pelo `txn.get` do ctx: a gravação concorrente faz a transação tentar de novo. */
  loadWalletTx(
    ctx: TransferTxContext,
    walletId: string,
    userId: string,
  ): Promise<TransferWallet | null>;

  saveWalletTx(
    ctx: TransferTxContext,
    wallet: TransferWallet,
    movements: TransferMovement[],
  ): Promise<void>;
}
