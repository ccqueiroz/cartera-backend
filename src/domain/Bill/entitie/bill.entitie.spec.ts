import { MaskAmountGateway } from '@/domain/Masks/MaskNumbers/gateway/mask-amount.gateway';
import { BillEntitie } from './bill.entitie';
import { CategoryGroupEnum } from '@/domain/Category/enums/category-group.enum';
import { CategoryDescriptionEnum } from '@/domain/Category/enums/category-description.enum';
import { BillDTO } from '../dtos/bill.dto';
import { PaymentStatusDescriptionEnum } from '@/domain/Payment_Status/enum/payment-status-description.enum';
import { PaymentMethodDescriptionEnum } from '@/domain/Payment_Method/enums/payment-method-description.enum';

let maskAmountGatewayMock: jest.Mocked<MaskAmountGateway>;

type BillDTOCreate = Omit<BillDTO, 'id' | 'updatedAt' | 'paymentStatus'>;
type BillDTOUpdate = Omit<BillDTO, 'paymentStatus'>;

describe('Bill Entitie', () => {
  beforeEach(() => {
    maskAmountGatewayMock = { mask: jest.fn() };

    BillEntitie.setMaskAmountGateway(maskAmountGatewayMock);
  });

  it('should be return Bill instance with mandatory attributes when call static method create of the BillEntitie class', () => {
    maskAmountGatewayMock.mask.mockReturnValue({
      value: '8209,56',
      unmask: '8209.56',
    });

    const billObject: BillDTOCreate = {
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Mensalidade Faculdade',
      categoryDescriptionEnum: CategoryDescriptionEnum.COLLEGE_TUITION,
      categoryGroup: CategoryGroupEnum.EDUCATION_AND_STUDIES,
      fixedBill: false,
      billDate: new Date().getTime(),
      payDate: new Date().getTime(),
      payOut: true,
      icon: null,
      amount: 8209.56,
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Educação',
      paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      isPaymentCardBill: false,
      isShoppingListBill: false,
      createdAt: new Date().getTime(),
    };

    const bill = BillEntitie.create(billObject);

    expect(bill.personUserId).toBe(billObject.personUserId);
    expect(bill.userId).toBe(billObject.userId);
    expect(bill.descriptionBill).toBe(billObject.descriptionBill);
    expect(bill.fixedBill).toBe(billObject.fixedBill);
    expect(bill.billDate).toEqual(expect.any(Number));
    expect(bill.payDate).toEqual(expect.any(Number));
    expect(bill.icon).toBeNull();
    expect(bill.amount).toBe(billObject.amount);
    expect(bill.paymentStatus).toBe(PaymentStatusDescriptionEnum.PAID);
    expect(bill.categoryId).toBe(billObject.categoryId);
    expect(bill.categoryDescription).toBe(billObject.categoryDescription);
    expect(bill.categoryDescriptionEnum).toBe(
      billObject.categoryDescriptionEnum,
    );
    expect(bill.categoryGroup).toBe(billObject.categoryGroup);
    expect(bill.paymentMethodId).toBe(billObject.paymentMethodId);
    expect(bill.paymentMethodDescription).toBe(
      billObject.paymentMethodDescription,
    );
    expect(bill.paymentMethodDescriptionEnum).toBe(
      billObject.paymentMethodDescriptionEnum,
    );
    expect(bill.isPaymentCardBill).toBe(billObject.isPaymentCardBill);
    expect(bill.invoiceCarData).toBe(undefined);
    expect(bill.isShoppingListBill).toBe(billObject.isShoppingListBill);
    expect(bill.shoppingListData).toBe(undefined);
    expect(bill.createdAt).toEqual(expect.any(Number));
  });

  it('should be return Bill instance with all attributes when call static method with of the BillEntitie class', () => {
    maskAmountGatewayMock.mask.mockReturnValue({
      value: '8209,56',
      unmask: '8209.56',
    });

    const billObject: BillDTOUpdate = {
      id: '24177d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Mensalidade Faculdade',
      categoryDescriptionEnum: CategoryDescriptionEnum.COLLEGE_TUITION,
      categoryGroup: CategoryGroupEnum.EDUCATION_AND_STUDIES,
      fixedBill: false,
      billDate: new Date().getTime(),
      payDate: new Date().getTime(),
      payOut: true,
      icon: null,
      amount: 8209.56,
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Educação',
      paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      isPaymentCardBill: false,
      isShoppingListBill: false,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    };

    const bill = BillEntitie.with(billObject);

    expect(bill.id).toBe(billObject.id);
    expect(bill.personUserId).toBe(billObject.personUserId);
    expect(bill.userId).toBe(billObject.userId);
    expect(bill.descriptionBill).toBe(billObject.descriptionBill);
    expect(bill.fixedBill).toBe(billObject.fixedBill);
    expect(bill.billDate).toEqual(expect.any(Number));
    expect(bill.payDate).toEqual(expect.any(Number));
    expect(bill.icon).toBeNull();
    expect(bill.amount).toBe(8209.56);
    expect(bill.paymentStatus).toBe(PaymentStatusDescriptionEnum.PAID);
    expect(bill.categoryId).toBe(billObject.categoryId);
    expect(bill.categoryDescription).toBe(billObject.categoryDescription);
    expect(bill.categoryDescriptionEnum).toBe(
      billObject.categoryDescriptionEnum,
    );
    expect(bill.categoryGroup).toBe(billObject.categoryGroup);
    expect(bill.categoryDescription).toBe(billObject.categoryDescription);
    expect(bill.paymentMethodId).toBe(billObject.paymentMethodId);
    expect(bill.paymentMethodDescription).toBe(
      billObject.paymentMethodDescription,
    );
    expect(bill.paymentMethodDescriptionEnum).toBe(
      billObject.paymentMethodDescriptionEnum,
    );
    expect(bill.isPaymentCardBill).toBe(billObject.isPaymentCardBill);
    expect(bill.invoiceCarData).toBe(undefined);
    expect(bill.isShoppingListBill).toBe(billObject.isShoppingListBill);
    expect(bill.shoppingListData).toBe(undefined);
    expect(bill.createdAt).toEqual(expect.any(Number));
    expect(bill.updatedAt).toEqual(expect.any(Number));
  });

  it('should throw an error when maskAmountGateway is not set', () => {
    BillEntitie.setMaskAmountGateway(undefined as unknown as MaskAmountGateway);

    const billObject: BillDTOCreate = {
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Mensalidade Faculdade',
      categoryDescriptionEnum: CategoryDescriptionEnum.COLLEGE_TUITION,
      categoryGroup: CategoryGroupEnum.EDUCATION_AND_STUDIES,
      fixedBill: false,
      billDate: new Date().getTime(),
      payDate: new Date().getTime(),
      payOut: true,
      icon: null,
      amount: 8209.56,
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Educação',
      paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      isPaymentCardBill: false,
      isShoppingListBill: false,
      createdAt: new Date().getTime(),
    };

    expect(() => BillEntitie.create(billObject)).toThrow(
      'MaskAmountGateway is not set. Please configure it first.',
    );
  });

  it('should throw an error when the amount attribute is null', () => {
    maskAmountGatewayMock.mask.mockReturnValue({
      value: '8209,56',
      unmask: '8209.56',
    });

    const billObject: BillDTOCreate = {
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Mensalidade Faculdade',
      categoryDescriptionEnum: CategoryDescriptionEnum.COLLEGE_TUITION,
      categoryGroup: CategoryGroupEnum.EDUCATION_AND_STUDIES,
      fixedBill: false,
      billDate: new Date().getTime(),
      payDate: new Date().getTime(),
      payOut: true,
      icon: null,
      amount: null as any,
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Educação',
      paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      isPaymentCardBill: false,
      isShoppingListBill: false,
      createdAt: new Date().getTime(),
    };

    expect(() => BillEntitie.create(billObject)).toThrow('Amount is required.');
  });

  it('should throw an error when the billDate attribute is null', () => {
    maskAmountGatewayMock.mask.mockReturnValue({
      value: '8209,56',
      unmask: '8209.56',
    });

    const billObject: BillDTOCreate = {
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Mensalidade Faculdade',
      categoryDescriptionEnum: CategoryDescriptionEnum.COLLEGE_TUITION,
      categoryGroup: CategoryGroupEnum.EDUCATION_AND_STUDIES,
      fixedBill: false,
      billDate: null,
      payDate: new Date().getTime(),
      payOut: true,
      icon: null,
      amount: 8209.56,
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Educação',
      paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      isPaymentCardBill: false,
      isShoppingListBill: false,
      createdAt: new Date().getTime(),
    };

    expect(() => BillEntitie.create(billObject)).toThrow(
      'Bill Date is not set. Please set the Bill date.',
    );
  });

  it('should be set paymentMethodId and paymentMethodDescription with undefined in case the payOut attribute is false', () => {
    maskAmountGatewayMock.mask.mockReturnValue({
      value: '8209,56',
      unmask: '8209.56',
    });

    const billObject: BillDTOCreate = {
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Mensalidade Faculdade',
      categoryDescriptionEnum: CategoryDescriptionEnum.COLLEGE_TUITION,
      categoryGroup: CategoryGroupEnum.EDUCATION_AND_STUDIES,
      fixedBill: false,
      billDate: new Date().getTime(),
      payDate: new Date().getTime(),
      payOut: false,
      icon: null,
      amount: 8209.56,
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Educação',
      paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      isPaymentCardBill: false,
      isShoppingListBill: false,
      createdAt: new Date().getTime(),
    };

    const bill = BillEntitie.create(billObject);

    expect(bill.payOut).toBe(billObject.payOut);
    expect(bill.paymentMethodId).toBeUndefined();
    expect(bill.paymentMethodDescription).toBeUndefined();
  });

  it('should be set paymentStatus with DUE_DAY in case the payOut attribute is false and analyzing the current date', () => {
    maskAmountGatewayMock.mask.mockReturnValue({
      value: '8209,56',
      unmask: '8209.56',
    });

    const billObject: BillDTOCreate = {
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Mensalidade Faculdade',
      categoryDescriptionEnum: CategoryDescriptionEnum.COLLEGE_TUITION,
      categoryGroup: CategoryGroupEnum.EDUCATION_AND_STUDIES,
      fixedBill: false,
      billDate: new Date().getTime(),
      payDate: null,
      payOut: false,
      icon: null,
      amount: 8209.56,
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Educação',
      isPaymentCardBill: false,
      isShoppingListBill: false,
      createdAt: new Date().getTime(),
    };

    const bill = BillEntitie.create(billObject);

    expect(bill.payOut).toBe(billObject.payOut);
    expect(bill.paymentStatus).toBe(PaymentStatusDescriptionEnum.DUE_DAY);
    expect(bill.paymentStatus).toBe('DUE_DAY');
  });

  it('should be set payDate like to null in case the payOut attribute is false', () => {
    maskAmountGatewayMock.mask.mockReturnValue({
      value: '8209,56',
      unmask: '8209.56',
    });

    const billObject: BillDTOCreate = {
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Mensalidade Faculdade',
      categoryDescriptionEnum: CategoryDescriptionEnum.COLLEGE_TUITION,
      categoryGroup: CategoryGroupEnum.EDUCATION_AND_STUDIES,
      fixedBill: false,
      billDate: new Date().getTime(),
      payDate: new Date().getTime(),
      payOut: false,
      icon: null,
      amount: 8209.56,
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Educação',
      paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      isPaymentCardBill: false,
      isShoppingListBill: false,
      createdAt: new Date().getTime(),
    };

    const bill = BillEntitie.create(billObject);

    expect(bill.payOut).toBe(billObject.payOut);
    expect(bill.payDate).not.toBe(billObject.payDate);
    expect(bill.payDate).toBeNull();
  });
});
