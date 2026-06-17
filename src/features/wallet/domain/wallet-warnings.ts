/**
 * Avisos de resposta (W2/W3/W11): saldo negativo e estouro de limite NUNCA
 * bloqueiam — sinalizam a realidade. Não são erros de domínio.
 */
export enum WalletWarning {
  BALANCE_NEGATIVE = 'BALANCE_NEGATIVE',
  OVERDRAFT_LIMIT_EXCEEDED = 'OVERDRAFT_LIMIT_EXCEEDED',
}

export function collectBalanceWarnings(input: {
  isNegative: boolean;
  exceedsLimit: boolean;
}): WalletWarning[] {
  const warnings: WalletWarning[] = [];
  if (input.isNegative) warnings.push(WalletWarning.BALANCE_NEGATIVE);
  if (input.exceedsLimit) warnings.push(WalletWarning.OVERDRAFT_LIMIT_EXCEEDED);
  return warnings;
}
