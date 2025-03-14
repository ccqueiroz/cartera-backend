import { MaskAmountGateway } from '@/domain/Masks/MaskNumbers/gateway/mask-amount.gateway';
import { ReceivableEntitie } from './receivable.entitie';

let maskAmountGatewayMock: jest.Mocked<MaskAmountGateway>;

describe('Receivable Entitie', () => {
  beforeEach(() => {
    maskAmountGatewayMock = {
      mask: jest.fn(),
    };

    ReceivableEntitie.setMaskAmountGateway(maskAmountGatewayMock);
  });
  it('should be return Receivable instance with mandatory attributes when call static method create of the ReceivableEntitie class', () => {
    maskAmountGatewayMock.mask.mockReturnValue({
      value: '8209,56',
      unmask: '8209.56',
    });

    const receivableObject = {
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionReceivable: 'Salário',
      fixedReceivable: true,
      receivableDate: new Date().getTime(),
      icon: null,
      amount: 8209.56,
      paymentStatusId: 'd5a2f9c1-3e6a-41b9-9e6d-5c8eaf39b1b2',
      paymentStatusDescription: 'Pago',
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Salário/Pró-labore',
      paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Depósito',
      createdAt: new Date().getTime(),
    };

    const receivable = ReceivableEntitie.create(receivableObject);

    expect(receivable.personUserId).toBe(receivableObject.personUserId);
    expect(receivable.userId).toBe(receivableObject.userId);
    expect(receivable.descriptionReceivable).toBe(
      receivableObject.descriptionReceivable,
    );
    expect(receivable.fixedReceivable).toBe(receivableObject.fixedReceivable);
    expect(receivable.receivableDate).toEqual(expect.any(Number));
    expect(receivable.icon).toBeNull();
    expect(receivable.amount).toBe(receivableObject.amount);
    expect(receivable.paymentStatusId).toBe(receivableObject.paymentStatusId);
    expect(receivable.paymentStatusDescription).toBe(
      receivableObject.paymentStatusDescription,
    );
    expect(receivable.categoryId).toBe(receivableObject.categoryId);
    expect(receivable.categoryDescription).toBe(
      receivableObject.categoryDescription,
    );
    expect(receivable.paymentMethodId).toBe(receivableObject.paymentMethodId);
    expect(receivable.paymentMethodDescription).toBe(
      receivableObject.paymentMethodDescription,
    );
    expect(receivable.createdAt).toEqual(expect.any(Number));
  });

  it('should be return Receivable instance with all attributes when call static method with of the ReceivableEntitie class', () => {
    maskAmountGatewayMock.mask.mockReturnValue({
      value: '8209,00',
      unmask: '8209.00',
    });

    const receivableObject = {
      id: '24177d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionReceivable: 'Salário',
      fixedReceivable: true,
      receivableDate: new Date().getTime(),
      icon: null,
      amount: 8209,
      paymentStatusId: 'd5a2f9c1-3e6a-41b9-9e6d-5c8eaf39b1b2',
      paymentStatusDescription: 'Pago',
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Salário/Pró-labore',
      paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Depósito',
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    };

    const receivable = ReceivableEntitie.with(receivableObject);

    expect(receivable.id).toBe(receivableObject.id);
    expect(receivable.personUserId).toBe(receivableObject.personUserId);
    expect(receivable.userId).toBe(receivableObject.userId);
    expect(receivable.descriptionReceivable).toBe(
      receivableObject.descriptionReceivable,
    );
    expect(receivable.fixedReceivable).toBe(receivableObject.fixedReceivable);
    expect(receivable.receivableDate).toEqual(expect.any(Number));
    expect(receivable.icon).toBeNull();
    expect(receivable.amount).toBe(8209);
    expect(receivable.paymentStatusId).toBe(receivableObject.paymentStatusId);
    expect(receivable.paymentStatusDescription).toBe(
      receivableObject.paymentStatusDescription,
    );
    expect(receivable.categoryId).toBe(receivableObject.categoryId);
    expect(receivable.categoryDescription).toBe(
      receivableObject.categoryDescription,
    );
    expect(receivable.paymentMethodId).toBe(receivableObject.paymentMethodId);
    expect(receivable.paymentMethodDescription).toBe(
      receivableObject.paymentMethodDescription,
    );
    expect(receivable.createdAt).toEqual(expect.any(Number));
    expect(receivable.updatedAt).toEqual(expect.any(Number));
  });

  it('should throw an error when maskAmountGateway is not set', () => {
    ReceivableEntitie.setMaskAmountGateway(
      undefined as unknown as MaskAmountGateway,
    );

    const receivableObject = {
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionReceivable: 'Salário',
      fixedReceivable: true,
      receivableDate: new Date().getTime(),
      icon: null,
      amount: 8209.56,
      paymentStatusId: 'd5a2f9c1-3e6a-41b9-9e6d-5c8eaf39b1b2',
      paymentStatusDescription: 'Pago',
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Salário/Pró-labore',
      paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Depósito',
      createdAt: new Date().getTime(),
    };

    expect(() => ReceivableEntitie.create(receivableObject)).toThrow(
      'MaskAmountGateway is not set. Please configure it first.',
    );
  });
});
