import { CreateReceivableUseCase } from './create-receivable.usecase';
import { ValidateCategoryPaymentMethodStatusUseCase } from '../validate_entities/validate-category-payment-method-status.usecase';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { CategoryServiceGateway } from '@/domain/Category/gateway/category.service.gateway';
import { PaymentMethodServiceGateway } from '@/domain/Payment_Method/gateway/payment-method.service.gateway';
import { PaymentStatusServiceGateway } from '@/domain/Payment_Status/gateway/payment-status.service.gateway';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ReceivableServiceGateway } from '@/domain/Receivable/gateway/receivable.service.gateway';

let receivableServiceMock: jest.Mocked<ReceivableServiceGateway>;

let createReceivableUseCase: CreateReceivableUseCase;

let categoryServiceGatewayMock: jest.Mocked<CategoryServiceGateway>;
let paymentMethodServiceGatewayMock: jest.Mocked<PaymentMethodServiceGateway>;
let paymentStatusServiceGatewayMock: jest.Mocked<PaymentStatusServiceGateway>;

let validateCategoryPaymentMethodStatusUseCase: ValidateCategoryPaymentMethodStatusUseCase;

const userIdMock = '1234567d';

describe('CreateReceivableUseCase', () => {
  beforeEach(() => {
    receivableServiceMock = {
      createReceivable: jest.fn(),
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

    createReceivableUseCase = CreateReceivableUseCase.create({
      receivableService: receivableServiceMock,
      validateCategoryPaymentMethodStatusService:
        validateCategoryPaymentMethodStatusUseCase,
    });
  });

  it('should be create a instance of the CreateReceivableUseCase class when will be use create method.', () => {
    expect(createReceivableUseCase).toBeInstanceOf(CreateReceivableUseCase);
  });

  it('should create a receivable when valid data is provided', async () => {
    const receivableData = {
      categoryId: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      paymentMethodId: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
      paymentStatusId: 'e76176ad-c2d8-4526-95cb-0440d0149d87',
      personUserId: 'e76176ad-c2d8-4526-95cb-123456749d87',
      userId: '1234567d-c2d8-4526-95cb-123456749d87',
      descriptionReceivable: 'Test Receivable',
      fixedReceivable: true,
      receivableDate: new Date().getTime(),
      icon: null,
      amount: 100,
      categoryDescription: 'Test Category',
      paymentMethodDescription: 'Test Payment Method',
      paymentStatusDescription: 'Paid',
      receival: false,
      receivalDate: null,
      createdAt: new Date().getTime(),
    };

    const receivable = {
      id: 'd41d8cd98f00b204e9800998ecf8427e',
    };

    receivableServiceMock.createReceivable.mockResolvedValue({
      id: 'd41d8cd98f00b204e9800998ecf8427e',
    });

    validateCategoryPaymentMethodStatusUseCase.execute = jest
      .fn()
      .mockResolvedValue(true);

    const result = await createReceivableUseCase.execute({
      receivableData,
      userId: userIdMock,
    });

    expect(result.data).not.toBeNull();

    expect(result.data?.id).toBe(receivable.id);
    expect(receivableServiceMock.createReceivable).toHaveBeenCalledWith({
      receivableData,
      userId: userIdMock,
    });
  });

  it('should throw an error if the category, payment method, or payment status is invalid', async () => {
    const receivableData = {
      categoryId: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      paymentMethodId: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
      paymentStatusId: 'e76176ad-c2d8-4526-95cb-0440d0149d87',
      personUserId: 'e76176ad-c2d8-4526-95cb-123456749d87',
      userId: '1234567d-c2d8-4526-95cb-123456749d87',
      descriptionReceivable: 'Test Receivable',
      fixedReceivable: true,
      receivableDate: new Date().getTime(),
      icon: null,
      amount: 100,
      categoryDescription: 'Test Category',
      paymentMethodDescription: 'Test Payment Method',
      paymentStatusDescription: 'Paid',
      receival: false,
      receivalDate: null,
      createdAt: new Date().getTime(),
    };

    validateCategoryPaymentMethodStatusUseCase.execute = jest
      .fn()
      .mockResolvedValue(false);

    const error = await createReceivableUseCase
      .execute({ receivableData, userId: userIdMock })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_CATEGORY_PAYMENT_METHOD_OR_PAYMENT_STATUS,
      statusCode: 400,
    });
    expect(receivableServiceMock.createReceivable).not.toHaveBeenCalled();
  });

  it('should return null if the receivable creation fails', async () => {
    const receivableData = {
      categoryId: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      paymentMethodId: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
      paymentStatusId: 'e76176ad-c2d8-4526-95cb-0440d0149d87',
      personUserId: 'e76176ad-c2d8-4526-95cb-123456749d87',
      userId: '1234567d-c2d8-4526-95cb-123456749d87',
      descriptionReceivable: 'Test Receivable',
      fixedReceivable: true,
      receivableDate: new Date().getTime(),
      icon: null,
      amount: 100,
      categoryDescription: 'Test Category',
      paymentMethodDescription: 'Test Payment Method',
      paymentStatusDescription: 'Paid',
      receival: false,
      receivalDate: null,
      createdAt: new Date().getTime(),
    };

    receivableServiceMock.createReceivable.mockResolvedValue(null);

    validateCategoryPaymentMethodStatusUseCase.execute = jest
      .fn()
      .mockResolvedValue(true);

    const result = await createReceivableUseCase.execute({
      receivableData,
      userId: userIdMock,
    });

    expect(result.data).toBeNull();

    expect(receivableServiceMock.createReceivable).toHaveBeenCalledWith({
      receivableData,
      userId: userIdMock,
    });
  });

  it('should be throw an error if the userId does not passed', async () => {
    const receivableData = {
      id: 'e76176ad-c2d8-4526-95cb-1434d5149dd4',
      categoryId: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      paymentMethodId: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
      paymentStatusId: 'e76176ad-c2d8-4526-95cb-0440d0149d87',
      personUserId: 'e76176ad-c2d8-4526-95cb-123456749d87',
      userId: '1234567d-c2d8-4526-95cb-123456749d87',
      descriptionReceivable: 'Test Receivable',
      fixedReceivable: true,
      receivableDate: new Date().getTime(),
      icon: null,
      amount: 100,
      categoryDescription: 'Test Category',
      paymentMethodDescription: 'Test Payment Method',
      paymentStatusDescription: 'Paid',
      receival: false,
      receivalDate: null,
      createdAt: new Date().getTime(),
    };

    const error = await createReceivableUseCase
      .execute({ receivableData, userId: '' })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_CREDENTIALS,
      statusCode: 401,
    });

    expect(receivableServiceMock.createReceivable).not.toHaveBeenCalled();
  });

  it('should be return data null when the response of the createReceivable repository dont contain id', async () => {
    const receivableData = {
      categoryId: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      paymentMethodId: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
      paymentStatusId: 'e76176ad-c2d8-4526-95cb-0440d0149d87',
      personUserId: 'e76176ad-c2d8-4526-95cb-123456749d87',
      userId: '1234567d-c2d8-4526-95cb-123456749d87',
      descriptionReceivable: 'Test Receivable',
      fixedReceivable: true,
      receivableDate: new Date().getTime(),
      icon: null,
      amount: 100,
      categoryDescription: 'Test Category',
      paymentMethodDescription: 'Test Payment Method',
      paymentStatusDescription: 'Paid',
      receival: false,
      receivalDate: null,
      createdAt: new Date().getTime(),
    };

    validateCategoryPaymentMethodStatusUseCase.execute = jest
      .fn()
      .mockResolvedValue(true);

    receivableServiceMock.createReceivable.mockResolvedValue({
      id: '',
    });

    const result = await createReceivableUseCase.execute({
      receivableData,
      userId: userIdMock,
    });

    expect(result).toEqual({
      data: null,
    });

    expect(receivableServiceMock.createReceivable).toHaveBeenCalledWith({
      receivableData,
      userId: userIdMock,
    });
  });
});
