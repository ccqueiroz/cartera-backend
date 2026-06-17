export enum WalletMovementDirectionEnum {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

export type WalletMovementDirection = `${WalletMovementDirectionEnum}`;

export enum WalletMovementRefTypeEnum {
  SETTLEMENT = 'SETTLEMENT',
  SETTLEMENT_REVERSAL = 'SETTLEMENT_REVERSAL',
  TRANSFER = 'TRANSFER',
  INVOICE = 'INVOICE',
  YIELD = 'YIELD',
  ADJUST = 'ADJUST',
  OVERDRAFT_INTEREST = 'OVERDRAFT_INTEREST',
}

export type WalletMovementRefType = `${WalletMovementRefTypeEnum}`;
