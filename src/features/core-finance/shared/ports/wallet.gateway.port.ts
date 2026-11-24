import { AtomicContext } from '@/shared/database/atomic-runner';
import { Money } from '@/shared/kernel/value-objects/money.vo';
import { SignedMoney } from '@/shared/kernel/value-objects/signed-money.vo';

/** O adaptador do bootstrap tipa o ctx por aqui, sem importar `src/shared/database/`. */
export type WalletTxContext = AtomicContext;

/**
 * A carteira lida dentro da transação: a entidade `Wallet` da feature wallet a
 * satisfaz por estrutura, sem objeto que a embrulhe, e o core-finance não importa
 * a outra feature.
 */
export interface SettlementWallet {
  readonly id: string;
  readonly balance: SignedMoney;
  debit(amount: Money, occurredAt: string, updatedAt: string): void;
  credit(amount: Money, updatedAt: string): void;
  closeOverdraftEpisode(): void;
  exceedsOverdraftLimit(): boolean;
}

/** Dado cru de um movimento de caixa a gravar dentro da transação atômica. */
export interface WalletMovementSpec {
  id: string;
  userId: string;
  walletId: string;
  direction: 'DEBIT' | 'CREDIT';
  amount: number;
  refType: 'SETTLEMENT' | 'SETTLEMENT_REVERSAL';
  refId: string;
  occurredAt: string;
  createdAt: string;
}

/** Movimento de liquidação original localizado para o estorno (B3). */
export interface SettlementMovementRef {
  walletId: string;
  amount: number;
}

/**
 * Porta de **escrita** de carteira que os condutores de core-finance
 * (bills/receivables) consomem: wallet é outra feature, então
 * core-finance define a porta e o bootstrap injeta o adapter. Distinta da
 * `WalletGateway` read-only do transfer. A carteira e o movimento são lidos e
 * gravados no `ctx` do AtomicRunner: as leituras antes das do motor, a escrita
 * depois delas (reads-before-writes).
 */
export interface WalletGateway {
  /** Lida pelo `txn.get` do ctx: a gravação concorrente faz a transação tentar de novo. */
  loadWalletTx(
    ctx: WalletTxContext,
    walletId: string,
    userId: string,
  ): Promise<SettlementWallet | null>;

  /** O `SETTLEMENT` mais novo da folha, lido no ctx, para o estorno mover a carteira certa. */
  findLatestSettlementTx(
    ctx: WalletTxContext,
    leafId: string,
    userId: string,
  ): Promise<SettlementMovementRef | null>;

  saveWalletTx(
    ctx: WalletTxContext,
    wallet: SettlementWallet,
    movements: WalletMovementSpec[],
  ): Promise<void>;
}
