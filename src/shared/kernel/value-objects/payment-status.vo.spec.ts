import { PaymentStatus } from './payment-status.vo';
import { PaymentStatusEnum } from '@/shared/kernel/enums/payment-status.enum';
import { TransactionTypeEnum } from '@/shared/kernel/enums/transaction-type.enum';

describe('PaymentStatus', () => {
  const today = new Date('2026-06-03T00:00:00.000Z');

  it('PAID when paid and BILLS, ignoring the dates', () => {
    const result = PaymentStatus.calculate({
      analysisDate: '2025-01-01',
      transactionType: TransactionTypeEnum.BILLS,
      isPaid: true,
      today,
    });
    expect(result.status).toBe(PaymentStatusEnum.PAID);
  });

  it('RECEIVED when paid and RECEIVABLES, ignoring the dates', () => {
    const result = PaymentStatus.calculate({
      analysisDate: '2025-01-01',
      transactionType: TransactionTypeEnum.RECEIVABLES,
      isPaid: true,
      today,
    });
    expect(result.status).toBe(PaymentStatusEnum.RECEIVED);
  });

  it('IN_PROGRESS when unpaid and there are open children, ignoring the dates', () => {
    const result = PaymentStatus.calculate({
      analysisDate: '2025-01-01',
      transactionType: TransactionTypeEnum.BILLS,
      isPaid: false,
      hasOpenChildren: true,
      today,
    });
    expect(result.status).toBe(PaymentStatusEnum.IN_PROGRESS);
  });

  it('PAID takes precedence over open children (BILLS)', () => {
    const result = PaymentStatus.calculate({
      analysisDate: '2025-01-01',
      transactionType: TransactionTypeEnum.BILLS,
      isPaid: true,
      hasOpenChildren: true,
      today,
    });
    expect(result.status).toBe(PaymentStatusEnum.PAID);
  });

  it('RECEIVED takes precedence over open children (RECEIVABLES)', () => {
    const result = PaymentStatus.calculate({
      analysisDate: '2025-01-01',
      transactionType: TransactionTypeEnum.RECEIVABLES,
      isPaid: true,
      hasOpenChildren: true,
      today,
    });
    expect(result.status).toBe(PaymentStatusEnum.RECEIVED);
  });

  it('hasOpenChildren ausente segue a regra de datas (OVERDUE)', () => {
    const result = PaymentStatus.calculate({
      analysisDate: '2026-06-02',
      transactionType: TransactionTypeEnum.BILLS,
      isPaid: false,
      today,
    });
    expect(result.status).toBe(PaymentStatusEnum.OVERDUE);
  });

  it('OVERDUE when unpaid and the analysis date has already passed', () => {
    const result = PaymentStatus.calculate({
      analysisDate: '2026-06-02',
      transactionType: TransactionTypeEnum.BILLS,
      isPaid: false,
      today,
    });
    expect(result.status).toBe(PaymentStatusEnum.OVERDUE);
  });

  it('DUE_DAY when unpaid and the analysis date is today', () => {
    const result = PaymentStatus.calculate({
      analysisDate: '2026-06-03',
      transactionType: TransactionTypeEnum.RECEIVABLES,
      isPaid: false,
      today,
    });
    expect(result.status).toBe(PaymentStatusEnum.DUE_DAY);
  });

  it.each([1, 3, 5])(
    'DUE_SOON when unpaid and %i day(s) remain (window [1,5])',
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

  it('TO_PAY when unpaid, BILLS and more than 5 days remain', () => {
    const result = PaymentStatus.calculate({
      analysisDate: '2026-06-10',
      transactionType: TransactionTypeEnum.BILLS,
      isPaid: false,
      today,
    });
    expect(result.status).toBe(PaymentStatusEnum.TO_PAY);
  });

  it('TO_RECEIVE when unpaid, RECEIVABLES and more than 5 days remain', () => {
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

  it('uses the current date when `today` is not injected', () => {
    const result = PaymentStatus.calculate({
      analysisDate: new Date(),
      transactionType: TransactionTypeEnum.RECEIVABLES,
      isPaid: false,
    });
    expect(result.status).toBe(PaymentStatusEnum.DUE_DAY);
  });
});
