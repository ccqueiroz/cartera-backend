export enum PaymentStatusEnum {
  PAID = 'PAID',
  RECEIVED = 'RECEIVED',
  TO_PAY = 'TO_PAY',
  TO_RECEIVE = 'TO_RECEIVE',
  DUE_SOON = 'DUE_SOON',
  DUE_DAY = 'DUE_DAY',
  OVERDUE = 'OVERDUE',
  IN_PROGRESS = 'IN_PROGRESS',
}

export type PaymentStatusCode = `${PaymentStatusEnum}`;
