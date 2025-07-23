import { PaymentStatusDescriptionEnum } from '../enum/payment-status-description.enum';
import { PaymentStatusEntitie } from './payment-status.entitie';

describe('Payment Status Entitie', () => {
  it('should be return PaymentStatus instance with mandatory attributes when call static status with of the PaymentStatusEntitie class', () => {
    const paymentStatusObject = {
      id: '06627d91-1aee-4479-859b-72f01c9ade24',
      description: 'Pago',
      descriptionEnum: PaymentStatusDescriptionEnum.PAID,
      createdAt: 1724708206117,
      updatedAt: 1724708206118,
    };

    const paymentStatus = PaymentStatusEntitie.with(paymentStatusObject);

    expect(paymentStatus.id).toBe(paymentStatusObject.id);
    expect(paymentStatus.description).toBe(paymentStatusObject.description);
    expect(paymentStatus.descriptionEnum).toBe(
      paymentStatusObject.descriptionEnum,
    );
  });

  it('should be return PaymentStatus instance with all attributes when call static status with of the PaymentStatusEntitie class', () => {
    const paymentStatusObject = {
      id: '06627d91-1aee-4479-859b-72f01c9ade24',
      description: 'A Pagar',
      descriptionEnum: PaymentStatusDescriptionEnum.TO_PAY,
      createdAt: 1724708206117,
      updatedAt: 1724708206118,
    };

    const paymentStatus = PaymentStatusEntitie.with(paymentStatusObject);

    expect(paymentStatus.id).toBe(paymentStatusObject.id);
    expect(paymentStatus.description).toBe(paymentStatusObject.description);
    expect(paymentStatus.descriptionEnum).toBe(
      paymentStatusObject.descriptionEnum,
    );
    expect(paymentStatus.createdAt).toBe(paymentStatusObject.createdAt);
    expect(paymentStatus.updatedAt).toBe(paymentStatusObject.updatedAt);
  });

  it('should return PAID when wasPaid is true and invoiceType is "bill"', () => {
    const result = PaymentStatusEntitie.setInvoiceStatus(
      true,
      Date.now(),
      Date.now(),
      'bill',
    );
    expect(result).toBe(PaymentStatusDescriptionEnum.PAID);
  });

  it('should return RECEIVED when wasPaid is true and invoiceType is "receivable"', () => {
    const result = PaymentStatusEntitie.setInvoiceStatus(
      true,
      Date.now(),
      Date.now(),
      'receivable',
    );
    expect(result).toBe(PaymentStatusDescriptionEnum.RECEIVED);
  });

  it('should return OVERDUE when referenceDate > invoiceDate', () => {
    const invoiceDate = new Date('2025-07-10').getTime();
    const referenceDate = new Date('2025-07-15').getTime();

    const result = PaymentStatusEntitie.setInvoiceStatus(
      false,
      invoiceDate,
      referenceDate,
      'bill',
    );
    expect(result).toBe(PaymentStatusDescriptionEnum.OVERDUE);
  });

  it('should return TO_PAY when diffInDays > 5 and invoiceType is "bill"', () => {
    const invoiceDate = new Date('2025-07-10').getTime();
    const referenceDate = new Date('2025-07-01').getTime();

    const result = PaymentStatusEntitie.setInvoiceStatus(
      false,
      invoiceDate,
      referenceDate,
      'bill',
    );
    expect(result).toBe(PaymentStatusDescriptionEnum.TO_PAY);
  });

  it('should return TO_RECEIVE when diffInDays > 5 and invoiceType is "receivable"', () => {
    const invoiceDate = new Date('2025-07-10').getTime();
    const referenceDate = new Date('2025-07-01').getTime();

    const result = PaymentStatusEntitie.setInvoiceStatus(
      false,
      invoiceDate,
      referenceDate,
      'receivable',
    );
    expect(result).toBe(PaymentStatusDescriptionEnum.TO_RECEIVE);
  });

  it('should return DUE_SOON when diffInDays is between 1 and 5', () => {
    const invoiceDate = new Date('2025-07-10').getTime();
    const referenceDate = new Date('2025-07-08').getTime();

    const result = PaymentStatusEntitie.setInvoiceStatus(
      false,
      invoiceDate,
      referenceDate,
      'bill',
    );
    expect(result).toBe(PaymentStatusDescriptionEnum.DUE_SOON);
  });

  it('should return DUE_DAY when diffInDays is 0', () => {
    const referenceDate = Date.now();
    const invoiceDate = referenceDate;
    const result = PaymentStatusEntitie.setInvoiceStatus(
      false,
      invoiceDate,
      referenceDate,
      'bill',
    );
    expect(result).toBe(PaymentStatusDescriptionEnum.DUE_DAY);
  });
});
