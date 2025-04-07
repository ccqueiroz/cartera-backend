import { BillGateway } from '@/domain/Bill/gateway/bill.gateway';
import { ValidateCategoryPaymentMethodStatusUseCase } from '../validate_entities/validate-category-payment-method-status.usecase';
import { PaymentStatusGateway } from '@/domain/Payment_Status/gateway/payment-status.gateway';
import { PaymentMethodGateway } from '@/domain/Payment_Method/gateway/payment-method.gateway';
import { CategoryGateway } from '@/domain/Category/gateway/category.gateway';
import { EditBillUseCase } from './edit-bill.usecase';
import { ApiError } from '@/helpers/errors';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';

const userIdMock = '1234567d';

let billGatewayMock: jest.Mocked<BillGateway>;

let editBillUseCase: EditBillUseCase;

let categoryGatewayMock: jest.Mocked<CategoryGateway>;
let paymentMethodGatewayMock: jest.Mocked<PaymentMethodGateway>;
let paymentStatusGatewayMock: jest.Mocked<PaymentStatusGateway>;

let validateCategoryPaymentMethodStatusUseCase: ValidateCategoryPaymentMethodStatusUseCase;
describe('EditBillUseCase', () => {
  beforeEach(() => {
    billGatewayMock = {
      getBills: jest.fn(),
      getBillById: jest.fn(),
      createBill: jest.fn(),
      updateBill: jest.fn(),
      deleteBill: jest.fn(),
      billsPayableMonth: jest.fn(),
    };


    categoryGatewayMock = {
      getCategories: jest.fn(),
      getCategoryById: jest.fn(),
    };

    paymentMethodGatewayMock = {
      getPaymentMethodById: jest.fn(),
      getPaymentMethods: jest.fn(),
    };

    paymentStatusGatewayMock = {
      getPaymentStatus: jest.fn(),
      getPaymentStatusById: jest.fn(),
    };

    validateCategoryPaymentMethodStatusUseCase =
      ValidateCategoryPaymentMethodStatusUseCase.create({
        categoryGateway: categoryGatewayMock,
        paymentMethodGateway: paymentMethodGatewayMock,
        paymentStatusGateway: paymentStatusGatewayMock,
      });

    editBillUseCase = EditBillUseCase.create({
      billGateway: billGatewayMock,
      validateCategoryPaymentMethodStatusService:
        validateCategoryPaymentMethodStatusUseCase,
    });
  });

  it('should be create a instance of the EditBillUseCase class when will be use create method.', () => {
    expect(editBillUseCase).toBeInstanceOf(EditBillUseCase);
  });

  it('should edit a bill when valid data and bill id are provided', async () => {
    const billObject = {
      id: '24177d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Faculdade',
      fixedBill: false,
      billDate: new Date().getTime(),
      payDate: new Date().getTime(),
      payOut: true,
      icon: null,
      amount: 8209.56,
      paymentStatusId: 'd5a2f9c1-3e6a-41b9-9e6d-5c8eaf39b1b2',
      paymentStatusDescription: 'Pago',
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Educação',
      paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      isPaymentCardBill: false,
      isShoppingListBill: false,
      createdAt: new Date().getTime(),
      updatedAt: null,
    };

    billGatewayMock.getBillById.mockResolvedValue({
      ...billObject,
      updatedAt: null,
    });

    validateCategoryPaymentMethodStatusUseCase.execute = jest
      .fn()
      .mockResolvedValue(true);

    billGatewayMock.updateBill.mockResolvedValue({
      ...billObject,
      descriptionBill: 'Test Bill updated',
      updatedAt: new Date().getTime(),
    });

    const result = await editBillUseCase.execute({
      billId: billObject.id,
      billData: billObject,
      userId: userIdMock,
    });

    expect(result.data?.id).toBe(billObject.id);
    expect(billGatewayMock.updateBill).toHaveBeenCalledWith({
      billId: billObject.id,
      billData: billObject,
      userId: userIdMock,
    });
    expect(result.data?.updatedAt).toEqual(expect.any(Number));
  });

  it('should throw an error if the category, payment method, or payment status is invalid.', async () => {
    const billObject = {
      id: '24177d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Faculdade',
      fixedBill: false,
      billDate: new Date().getTime(),
      payDate: new Date().getTime(),
      payOut: true,
      icon: null,
      amount: 8209.56,
      paymentStatusId: 'd5a2f9c1-3e6a-41b9-9e6d-5c8eaf39b1b2',
      paymentStatusDescription: 'Pago',
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Educação',
      paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      isPaymentCardBill: false,
      isShoppingListBill: false,
      createdAt: new Date().getTime(),
      updatedAt: null,
    };

    billGatewayMock.getBillById.mockResolvedValue({
      ...billObject,
      updatedAt: null,
    });

    validateCategoryPaymentMethodStatusUseCase.execute = jest
      .fn()
      .mockResolvedValue(false);

    const error = await editBillUseCase
      .execute({
        billId: billObject.id,
        billData: billObject,
        userId: userIdMock,
      })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_CATEGORY_PAYMENT_METHOD_OR_PAYMENT_STATUS,
      statusCode: 400,
    });
    expect(billGatewayMock.updateBill).not.toHaveBeenCalled();
  });

  it('should throw an error if billId is not exist in data base.', async () => {
    const billObject = {
      id: '24177d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Faculdade',
      fixedBill: false,
      billDate: new Date().getTime(),
      payDate: new Date().getTime(),
      payOut: true,
      icon: null,
      amount: 8209.56,
      paymentStatusId: 'd5a2f9c1-3e6a-41b9-9e6d-5c8eaf39b1b2',
      paymentStatusDescription: 'Pago',
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Educação',
      paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      isPaymentCardBill: false,
      isShoppingListBill: false,
      createdAt: new Date().getTime(),
      updatedAt: null,
    };

    billGatewayMock.getBillById.mockResolvedValue(null);

    const error = await editBillUseCase
      .execute({
        billId: billObject.id,
        billData: billObject,
        userId: userIdMock,
      })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.BILL_NOT_FOUND,
      statusCode: 404,
    });
    expect(billGatewayMock.updateBill).not.toHaveBeenCalled();
  });

  it('should throw an error if billId is invalid', async () => {
    const billObject = {
      id: '24177d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Faculdade',
      fixedBill: false,
      billDate: new Date().getTime(),
      payDate: new Date().getTime(),
      payOut: true,
      icon: null,
      amount: 8209.56,
      paymentStatusId: 'd5a2f9c1-3e6a-41b9-9e6d-5c8eaf39b1b2',
      paymentStatusDescription: 'Pago',
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Educação',
      paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      isPaymentCardBill: false,
      isShoppingListBill: false,
      createdAt: new Date().getTime(),
      updatedAt: null,
    };

    const error = await editBillUseCase
      .execute({
        billId: '',
        billData: billObject,
        userId: userIdMock,
      })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS,
      statusCode: 400,
    });

    expect(billGatewayMock.updateBill).not.toHaveBeenCalled();
  });

  it('should be throw an error if the userId does not passed', async () => {
    const billObject = {
      id: '24177d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Faculdade',
      fixedBill: false,
      billDate: new Date().getTime(),
      payDate: new Date().getTime(),
      payOut: true,
      icon: null,
      amount: 8209.56,
      paymentStatusId: 'd5a2f9c1-3e6a-41b9-9e6d-5c8eaf39b1b2',
      paymentStatusDescription: 'Pago',
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Educação',
      paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      isPaymentCardBill: false,
      isShoppingListBill: false,
      createdAt: new Date().getTime(),
      updatedAt: null,
    };

    const error = await editBillUseCase
      .execute({ billId: '', billData: billObject, userId: '' })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_CREDENTIALS,
      statusCode: 401,
    });

    expect(billGatewayMock.updateBill).not.toHaveBeenCalled();
  });
});
