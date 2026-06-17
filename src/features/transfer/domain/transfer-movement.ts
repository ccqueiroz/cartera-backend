/**
 * Registro de movimento de caixa que a transferência grava na coleção
 * `WalletMovement` (DEBIT na origem, CREDIT no destino), com `refType = TRANSFER`
 * e `refId = transfer.id`. Shape puro e append-only — espelha o do ledger de
 * wallet sem importar a entidade da outra feature (fronteira de feature).
 */
export interface TransferMovement {
  id: string;
  userId: string;
  walletId: string;
  direction: 'DEBIT' | 'CREDIT';
  amount: number;
  refType: 'TRANSFER';
  refId: string;
  occurredAt: string;
  createdAt: string;
}
