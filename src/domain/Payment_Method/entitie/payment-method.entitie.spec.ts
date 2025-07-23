import { PaymentMethodDescriptionEnum } from '../enums/payment-method-description.enum';
import { PaymentMethodEntitie } from './payment-method.entitie';

describe('Payment Method Entitie', () => {
  it('should be return PaymentMethod instance with mandatory attributes when call static method with of the PaymentMethodEntitie class', () => {
    const paymentMethodObject = {
      id: 'Ak982jkk118279',
      description: 'Cartão de Crédito',
      descriptionEnum: PaymentMethodDescriptionEnum.CREDIT_CARD,
      createdAt: 1724708206117,
      updatedAt: 1724708206118,
    };

    const paymentMethod = PaymentMethodEntitie.with(paymentMethodObject);

    expect(paymentMethod.id).toBe(paymentMethodObject.id);
    expect(paymentMethod.description).toBe(paymentMethodObject.description);
  });

  it('should be return PaymentMethod instance with all attributes when call static method with of the PaymentMethodEntitie class', () => {
    const paymentMethodObject = {
      id: 'Ak982jkk118279',
      description: 'Cartão de Crédito',
      descriptionEnum: PaymentMethodDescriptionEnum.CREDIT_CARD,
      createdAt: 1724708206117,
      updatedAt: 1724708206118,
    };

    const paymentMethod = PaymentMethodEntitie.with(paymentMethodObject);

    expect(paymentMethod.id).toBe(paymentMethodObject.id);
    expect(paymentMethod.description).toBe(paymentMethodObject.description);
    expect(paymentMethod.createdAt).toBe(paymentMethodObject.createdAt);
    expect(paymentMethod.updatedAt).toBe(paymentMethodObject.updatedAt);
  });
});
