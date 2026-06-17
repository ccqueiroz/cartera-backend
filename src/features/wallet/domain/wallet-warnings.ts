import {
  BalanceWarning,
  collectBalanceWarnings,
} from '@/shared/kernel/value-objects/balance-warnings';

/** Canal de warnings promovido a `shared/kernel` (reusado por transfer). Alias mantido. */
export const WalletWarning = BalanceWarning;
export type WalletWarning = BalanceWarning;
export { collectBalanceWarnings };
