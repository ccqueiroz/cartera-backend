import { ValidateCategoryPaymentMethodStatusUseCase } from '../validate_entities/validate-category-payment-method-status.usecase';
import { CreateBillUseCase } from './create-bill.usecase';
import { ApiError } from '@/helpers/errors';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { CategoryServiceGateway } from '@/domain/Category/gateway/category.service.gateway';
import { PaymentMethodServiceGateway } from '@/domain/Payment_Method/gateway/payment-method.service.gateway';
import { PaymentStatusServiceGateway } from '@/domain/Payment_Status/gateway/payment-status.service.gateway';
import { BillServiceGateway } from '@/domain/Bill/gateway/bill.service.gateway';

const userIdMock = '1234567d';

let billServiceMock: jest.Mocked<BillServiceGateway>;

let createBillUseCase: CreateBillUseCase;

let categoryServiceGatewayMock: jest.Mocked<CategoryServiceGateway>;
let paymentMethodServiceGatewayMock: jest.Mocked<PaymentMethodServiceGateway>;
let paymentStatusServiceGatewayMock: jest.Mocked<PaymentStatusServiceGateway>;

let validateCategoryPaymentMethodStatusUseCase: ValidateCategoryPaymentMethodStatusUseCase;
describe('CreateBillUseCase', () => {
  beforeEach(() => {
    billServiceMock = {
      createBill: jest.fn(),
    } as any;

    categoryServiceGatewayMock = {
      getCategories: jest.fn(),
    } as any;

    paymentMethodServiceGatewayMock = {
      getPaymentMethods: jest.fn(),
    } as any;

    paymentStatusServiceGatewayMock = {
      getPaymentStatus: jest.fn(),
    } as any;

    validateCategoryPaymentMethodStatusUseCase =
      ValidateCategoryPaymentMethodStatusUseCase.create({
        categoryService: categoryServiceGatewayMock,
        paymentMethodService: paymentMethodServiceGatewayMock,
        paymentStatusServiceGateway: paymentStatusServiceGatewayMock,
      });

    createBillUseCase = CreateBillUseCase.create({
      billService: billServiceMock,
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

    billServiceMock.createBill.mockResolvedValue({
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
    expect(billServiceMock.createBill).toHaveBeenCalledWith({
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

    billServiceMock.createBill.mockResolvedValue(null);

    validateCategoryPaymentMethodStatusUseCase.execute = jest
      .fn()
      .mockResolvedValue(true);

    const result = await createBillUseCase.execute({
      billData: billObject,
      userId: userIdMock,
    });

    expect(result.data).toBeNull();

    expect(billServiceMock.createBill).toHaveBeenCalledWith({
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

    expect(billServiceMock.createBill).not.toHaveBeenCalled();
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

    billServiceMock.createBill.mockResolvedValue({
      id: '',
    });

    const result = await createBillUseCase.execute({
      billData: billObject,
      userId: userIdMock,
    });

    expect(result).toEqual({
      data: null,
    });

    expect(billServiceMock.createBill).toHaveBeenCalledWith({
      billData: billObject,
      userId: userIdMock,
    });
  });
});
