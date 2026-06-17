/**
 * Avisos de resposta (W2/W3/W11): saldo negativo e estouro de limite NUNCA
 * bloqueiam — sinalizam a realidade. Não são erros de domínio. Mora no kernel
 * porque é canal compartilhado entre features (wallet e transfer).
 */
export enum BalanceWarning {
  BALANCE_NEGATIVE = 'BALANCE_NEGATIVE',
  OVERDRAFT_LIMIT_EXCEEDED = 'OVERDRAFT_LIMIT_EXCEEDED',
}

export function collectBalanceWarnings(input: {
  isNegative: boolean;
  exceedsLimit: boolean;
}): BalanceWarning[] {
  const warnings: BalanceWarning[] = [];
  if (input.isNegative) warnings.push(BalanceWarning.BALANCE_NEGATIVE);
  if (input.exceedsLimit)
    warnings.push(BalanceWarning.OVERDRAFT_LIMIT_EXCEEDED);
  return warnings;
}
