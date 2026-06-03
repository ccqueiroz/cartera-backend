import { PaymentStatus } from './payment-status.vo';
import { PaymentStatusEnum } from '../enums/payment-status.enum';
import { TransactionTypeEnum } from '../enums/transaction-type.enum';

describe('PaymentStatus', () => {
  const today = new Date('2026-06-03T00:00:00.000Z');

  it('PAID quando pago e BILLS, ignorando as datas', () => {
    const result = PaymentStatus.calculate({
      analysisDate: '2025-01-01',
      transactionType: TransactionTypeEnum.BILLS,
      isPaid: true,
      today,
    });
    expect(result.status).toBe(PaymentStatusEnum.PAID);
  });

  it('RECEIVED quando pago e RECEIVABLES, ignorando as datas', () => {
    const result = PaymentStatus.calculate({
      analysisDate: '2025-01-01',
      transactionType: TransactionTypeEnum.RECEIVABLES,
      isPaid: true,
      today,
    });
    expect(result.status).toBe(PaymentStatusEnum.RECEIVED);
  });

  it('OVERDUE quando não pago e a data de análise já passou', () => {
    const result = PaymentStatus.calculate({
      analysisDate: '2026-06-02',
      transactionType: TransactionTypeEnum.BILLS,
      isPaid: false,
      today,
    });
    expect(result.status).toBe(PaymentStatusEnum.OVERDUE);
  });

  it('DUE_DAY quando não pago e a data de análise é hoje', () => {
    const result = PaymentStatus.calculate({
      analysisDate: '2026-06-03',
      transactionType: TransactionTypeEnum.RECEIVABLES,
      isPaid: false,
      today,
    });
    expect(result.status).toBe(PaymentStatusEnum.DUE_DAY);
  });

  it.each([1, 3, 5])(
    'DUE_SOON quando não pago e faltam %i dia(s) (janela [1,5])',
    (daysAhead) => {
      const analysisDate = new Date('2026-06-03T00:00:00.000Z');
      analysisDate.setUTCDate(analysisDate.getUTCDate() + daysAhead);
      const result = PaymentStatus.calculate({
        analysisDate,
        transactionType: TransactionTypeEnum.BILLS,
        isPaid: false,
        today,
      });
      expect(result.status).toBe(PaymentStatusEnum.DUE_SOON);
    },
  );

  it('TO_PAY quando não pago, BILLS e faltam mais de 5 dias', () => {
    const result = PaymentStatus.calculate({
      analysisDate: '2026-06-10',
      transactionType: TransactionTypeEnum.BILLS,
      isPaid: false,
      today,
    });
    expect(result.status).toBe(PaymentStatusEnum.TO_PAY);
  });

  it('TO_RECEIVE quando não pago, RECEIVABLES e faltam mais de 5 dias', () => {
    const result = PaymentStatus.calculate({
      analysisDate: '2026-06-10',
      transactionType: TransactionTypeEnum.RECEIVABLES,
      isPaid: false,
      today,
    });
    expect(result.status).toBe(PaymentStatusEnum.TO_RECEIVE);
  });

  it('descarta a hora: mesmo dia UTC em horas diferentes colapsa em DUE_DAY', () => {
    const result = PaymentStatus.calculate({
      analysisDate: new Date('2026-06-03T23:59:59.000Z'),
      transactionType: TransactionTypeEnum.BILLS,
      isPaid: false,
      today: new Date('2026-06-03T00:00:01.000Z'),
    });
    expect(result.status).toBe(PaymentStatusEnum.DUE_DAY);
  });

  it('usa a data corrente quando `today` não é injetado', () => {
    const result = PaymentStatus.calculate({
      analysisDate: new Date(),
      transactionType: TransactionTypeEnum.RECEIVABLES,
      isPaid: false,
    });
    expect(result.status).toBe(PaymentStatusEnum.DUE_DAY);
  });
});
