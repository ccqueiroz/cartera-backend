import { TransactionOutput } from '@/features/core-finance/transaction-engine/domain/transaction.entity';
import { BalanceWarning } from '@/shared/kernel/value-objects/balance-warnings';

/** View mínima de carteira na resposta — não vaza a entidade Wallet; `balance` puro (§4.7). */
export interface ReceivableWalletView {
  id: string;
  balance: number;
}

/** Envelope de liquidação de Receivable, espelhando o de bills. */
export interface SettleReceivableResult {
  root: TransactionOutput;
  wallet: ReceivableWalletView;
  warnings: BalanceWarning[];
}

/** Resultado de criação: só `root` quando a receber; com wallet/warnings quando nasce recebida. */
export interface CreateReceivableResult {
  root: TransactionOutput;
  wallet?: ReceivableWalletView;
  warnings?: BalanceWarning[];
}
