export enum TransactionOriginEnum {
  MANUAL = 'MANUAL',
  CARD_PURCHASE = 'CARD_PURCHASE',
  CARD_INVOICE = 'CARD_INVOICE',
  SHOPPING_LIST = 'SHOPPING_LIST',
  RECURRENCE = 'RECURRENCE',
  IMPORT = 'IMPORT',
}

export type TransactionOrigin = `${TransactionOriginEnum}`;
