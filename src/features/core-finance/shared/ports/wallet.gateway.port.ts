import { AtomicContext } from '@/shared/database/atomic-runner';
import { WalletSnapshot } from '@/features/core-finance/shared/domain/wallet-snapshot';

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
 * (bills/receivables) consomem (regra §4.3): wallet é outra feature, então
 * core-finance define a porta e o bootstrap injeta o adapter. Distinta da
 * `WalletGateway` read-only do transfer. As leituras de snapshot/movimento são
 * não-transacionais (acontecem antes do bloco); a escrita participa do `ctx` do
 * AtomicRunner (só escreve — reads-before-writes do motor já rodaram).
 */
export interface WalletGateway {
  findActiveSnapshot(
    walletId: string,
    userId: string,
  ): Promise<WalletSnapshot | null>;

  /** Movimento `SETTLEMENT` rastreável da folha (para o estorno mover a wallet certa). */
  findSettlementMovement(
    leafId: string,
    userId: string,
  ): Promise<SettlementMovementRef | null>;

  /** Grava saldo + movimentos na transação externa (AtomicRunner). Só escrita. */
  persistSettlement(
    ctx: AtomicContext,
    snapshot: WalletSnapshot,
    movements: WalletMovementSpec[],
  ): Promise<void>;
}
