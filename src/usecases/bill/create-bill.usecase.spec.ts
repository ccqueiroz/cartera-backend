import { BillGateway } from '@/domain/Bill/gateway/bill.gateway';
import { CategoryGateway } from '@/domain/Category/gateway/category.gateway';
import { PaymentMethodGateway } from '@/domain/Payment_Method/gateway/payment-method.gateway';
import { PaymentStatusGateway } from '@/domain/Payment_Status/gateway/payment-status.gateway';
import { ValidateCategoryPaymentMethodStatusUseCase } from '../validate_entities/validate-category-payment-method-status.usecase';
import { CreateBillUseCase } from './create-bill.usecase';
import { ApiError } from '@/helpers/errors';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';

const userIdMock = '1234567d';

let billGatewayMock: jest.Mocked<BillGateway>;

let createBillUseCase: CreateBillUseCase;

let categoryGatewayMock: jest.Mocked<CategoryGateway>;
let paymentMethodGatewayMock: jest.Mocked<PaymentMethodGateway>;
let paymentStatusGatewayMock: jest.Mocked<PaymentStatusGateway>;

let validateCategoryPaymentMethodStatusUseCase: ValidateCategoryPaymentMethodStatusUseCase;
describe('CreateBillUseCase', () => {
  beforeEach(() => {
    billGatewayMock = {
      getBills: jest.fn(),
      getBillById: jest.fn(),
      createBill: jest.fn(),
      updateBill: jest.fn(),
      deleteBill: jest.fn(),
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

    createBillUseCase = CreateBillUseCase.create({
      billGateway: billGatewayMock,
      validateCategoryPaymentMethodStatusService:
        validateCategoryPaymentMethodStatusUseCase,
    });
  });

  it('should be create a instance of the CreateBillUseCase class when will be use create method.', () => {
    expect(createBillUseCase).toBeInstanceOf(CreateBillUseCase);
  });

  it('should create a receivable when valid data is provided', async () => {
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
    };

    const bill = {
      id: 'd41d8cd98f00b204e9800998ecf8427e',
    };

    billGatewayMock.createBill.mockResolvedValue({
      id: 'd41d8cd98f00b204e9800998ecf8427e',
    });

    validateCategoryPaymentMethodStatusUseCase.execute = jest
      .fn()
      .mockResolvedValue(true);

    const result = await createBillUseCase.execute({
      billData: billObject,
      userId: userIdMock,
    });

    expect(result.data).not.toBeNull();

    expect(result.data?.id).toBe(bill.id);
    expect(billGatewayMock.createBill).toHaveBeenCalledWith({
      billData: billObject,
      userId: userIdMock,
    });
  });

  it('should return null if the bill creation fails', async () => {
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
    };

    billGatewayMock.createBill.mockResolvedValue(null);

    validateCategoryPaymentMethodStatusUseCase.execute = jest
      .fn()
      .mockResolvedValue(true);

    const result = await createBillUseCase.execute({
      billData: billObject,
      userId: userIdMock,
    });

    expect(result.data).toBeNull();

    expect(billGatewayMock.createBill).toHaveBeenCalledWith({
      billData: billObject,
      userId: userIdMock,
    });
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
    };

    const error = await createBillUseCase
      .execute({ billData: billObject, userId: '' })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_CREDENTIALS,
      statusCode: 401,
    });

    expect(billGatewayMock.createBill).not.toHaveBeenCalled();
  });

  it('should be return data null when the response of the createReceivable repository dont contain id', async () => {
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
    };

    validateCategoryPaymentMethodStatusUseCase.execute = jest
      .fn()
      .mockResolvedValue(true);

    billGatewayMock.createBill.mockResolvedValue({
      id: '',
    });

    const result = await createBillUseCase.execute({
      billData: billObject,
      userId: userIdMock,
    });

    expect(result).toEqual({
      data: null,
    });

    expect(billGatewayMock.createBill).toHaveBeenCalledWith({
      billData: billObject,
      userId: userIdMock,
    });
  });
});
