export enum TransactionTypeEnum {
  BILLS = 'BILLS',
  RECEIVABLES = 'RECEIVABLES',
}

export type TransactionType = `${TransactionTypeEnum}`;
