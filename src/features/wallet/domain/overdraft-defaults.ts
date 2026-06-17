/**
 * Defaults de cobrança do cheque-especial (base FEBRABAN 2026, decisão W13).
 * A taxa mensal default é o teto do Banco Central (Res. 4.765/2020) e é aplicada
 * só quando o usuário não informa a taxa da própria carteira.
 */
export const DEFAULT_OVERDRAFT_MONTHLY_RATE = 0.08;
export const DEFAULT_OVERDRAFT_IOF_DAILY_RATE = 0.0038;
export const OVERDRAFT_IOF_ANNUAL_CEILING = 0.2988;
export const DEFAULT_OVERDRAFT_GRACE_DAYS = 0;
