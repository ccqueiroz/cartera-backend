import { PaymentStatusEntitie } from './payment-status.entitie';

describe('Payment Status Entitie', () => {
  it('should be return PaymentStatus instance with mandatory attributes when call static status with of the PaymentStatusEntitie class', () => {
    const paymentStatusObject = {
      id: '06627d91-1aee-4479-859b-72f01c9ade24',
      description: 'Pago',
    };

    const paymentStatus = PaymentStatusEntitie.with(paymentStatusObject);

    expect(paymentStatus.id).toBe(paymentStatusObject.id);
    expect(paymentStatus.description).toBe(paymentStatusObject.description);
  });

  it('should be return PaymentStatus instance with all attributes when call static status with of the PaymentStatusEntitie class', () => {
    const paymentStatusObject = {
      id: '06627d91-1aee-4479-859b-72f01c9ade24',
      description: 'A Pagar',
      createdAt: '1724708206117',
      updatedAt: '1724708206118',
    };

    const paymentStatus = PaymentStatusEntitie.with(paymentStatusObject);

    expect(paymentStatus.id).toBe(paymentStatusObject.id);
    expect(paymentStatus.description).toBe(paymentStatusObject.description);
    expect(paymentStatus.createdAt).toBe(paymentStatusObject.createdAt);
    expect(paymentStatus.updatedAt).toBe(paymentStatusObject.updatedAt);
  });
});
