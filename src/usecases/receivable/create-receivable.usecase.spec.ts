import { CreateReceivableUseCase } from './create-receivable.usecase';
import { ValidateCategoryPaymentMethodUseCase } from '../validate_entities/validate-category-payment-method.usecase';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { CategoryServiceGateway } from '@/domain/Category/gateway/category.service.gateway';
import { PaymentMethodServiceGateway } from '@/domain/Payment_Method/gateway/payment-method.service.gateway';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ReceivableServiceGateway } from '@/domain/Receivable/gateway/receivable.service.gateway';
import { CategoryDescriptionEnum } from '@/domain/Category/enums/category-description.enum';
import { CategoryGroupEnum } from '@/domain/Category/enums/category-group.enum';
import { PaymentMethodDescriptionEnum } from '@/domain/Payment_Method/enums/payment-method-description.enum';
import { PaymentStatusDescriptionEnum } from '@/domain/Payment_Status/enum/payment-status-description.enum';

let receivableServiceMock: jest.Mocked<ReceivableServiceGateway>;

let createReceivableUseCase: CreateReceivableUseCase;

let categoryServiceGatewayMock: jest.Mocked<CategoryServiceGateway>;
let paymentMethodServiceGatewayMock: jest.Mocked<PaymentMethodServiceGateway>;

let validateCategoryPaymentMethodUseCase: ValidateCategoryPaymentMethodUseCase;

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

    validateCategoryPaymentMethodUseCase =
      ValidateCategoryPaymentMethodUseCase.create({
        categoryService: categoryServiceGatewayMock,
        paymentMethodService: paymentMethodServiceGatewayMock,
      });

    createReceivableUseCase = CreateReceivableUseCase.create({
      receivableService: receivableServiceMock,
      validateCategoryPaymentMethodService:
        validateCategoryPaymentMethodUseCase,
    });
  });

  it('should be create a instance of the CreateReceivableUseCase class when will be use create method.', () => {
    expect(createReceivableUseCase).toBeInstanceOf(CreateReceivableUseCase);
  });

  it('should create a receivable when valid data is provided', async () => {
    const receivableData = {
      personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
      userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
      descriptionReceivable: 'Test Receivable 2',
      fixedReceivable: false,
      receivableDate: new Date().getTime(),
      receivalDate: new Date().getTime(),
      receival: true,
      icon: null,
      amount: 200,
      categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      categoryDescription: 'Aluguéis e Rendimentos de Ativos',
      categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
      categoryGroup: CategoryGroupEnum.REVENUES,
      paymentMethodId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      paymentMethodDescription: 'Pix',
      paymmentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      createdAt: new Date().getTime(),
    };

    const receivable = {
      id: 'd41d8cd98f00b204e9800998ecf8427e',
    };

    receivableServiceMock.createReceivable.mockResolvedValue({
      id: 'd41d8cd98f00b204e9800998ecf8427e',
    });

    validateCategoryPaymentMethodUseCase.execute = jest
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

  it('should throw an error if the category or payment method are invalid', async () => {
    const receivableData = {
      personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
      userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
      descriptionReceivable: 'Test Receivable 2',
      fixedReceivable: false,
      receivableDate: new Date().getTime(),
      receivalDate: new Date().getTime(),
      receival: true,
      icon: null,
      amount: 200,
      categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      categoryDescription: 'Aluguéis e Rendimentos de Ativos',
      categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
      categoryGroup: CategoryGroupEnum.REVENUES,
      paymentMethodId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      paymentMethodDescription: 'Pix',
      paymmentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      createdAt: new Date().getTime(),
    };

    validateCategoryPaymentMethodUseCase.execute = jest
      .fn()
      .mockResolvedValue(false);

    const error = await createReceivableUseCase
      .execute({ receivableData, userId: userIdMock })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_CATEGORY_OR_PAYMENT_METHOD,
      statusCode: 400,
    });
    expect(receivableServiceMock.createReceivable).not.toHaveBeenCalled();
  });

  it('should return null if the receivable creation fails', async () => {
    const receivableData = {
      personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
      userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
      descriptionReceivable: 'Test Receivable 2',
      fixedReceivable: false,
      receivableDate: new Date().getTime(),
      receivalDate: new Date().getTime(),
      receival: true,
      icon: null,
      amount: 200,
      categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      categoryDescription: 'Aluguéis e Rendimentos de Ativos',
      categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
      categoryGroup: CategoryGroupEnum.REVENUES,
      paymentMethodId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      paymentMethodDescription: 'Pix',
      paymmentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      createdAt: new Date().getTime(),
    };

    receivableServiceMock.createReceivable.mockResolvedValue(null);

    validateCategoryPaymentMethodUseCase.execute = jest
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
      personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
      userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
      descriptionReceivable: 'Test Receivable 2',
      fixedReceivable: false,
      receivableDate: new Date().getTime(),
      receivalDate: new Date().getTime(),
      receival: true,
      icon: null,
      amount: 200,
      categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      categoryDescription: 'Aluguéis e Rendimentos de Ativos',
      categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
      categoryGroup: CategoryGroupEnum.REVENUES,
      paymentMethodId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      paymentMethodDescription: 'Pix',
      paymmentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
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
      personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
      userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
      descriptionReceivable: 'Test Receivable 2',
      fixedReceivable: false,
      receivableDate: new Date().getTime(),
      receivalDate: new Date().getTime(),
      receival: true,
      icon: null,
      amount: 200,
      categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      categoryDescription: 'Aluguéis e Rendimentos de Ativos',
      categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
      categoryGroup: CategoryGroupEnum.REVENUES,
      paymentMethodId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      paymentMethodDescription: 'Pix',
      paymmentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      createdAt: new Date().getTime(),
    };

    validateCategoryPaymentMethodUseCase.execute = jest
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

  it('should throw if receivalDate is missing and receival are true', async () => {
    const receivableData = {
      personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
      userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
      descriptionReceivable: 'Test Receivable 2',
      fixedReceivable: false,
      receivableDate: new Date().getTime(),
      receivalDate: null,
      receival: true,
      icon: null,
      amount: 200,
      categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      categoryDescription: 'Aluguéis e Rendimentos de Ativos',
      categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
      categoryGroup: CategoryGroupEnum.REVENUES,
      paymentMethodId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      paymentMethodDescription: 'Pix',
      paymmentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      createdAt: new Date().getTime(),
    };

    validateCategoryPaymentMethodUseCase.execute = jest
      .fn()
      .mockResolvedValue(true);

    const error = await createReceivableUseCase
      .execute({ receivableData, userId: userIdMock })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INFORME_PAY_DATE_BILL,
      statusCode: 400,
    });

    expect(receivableServiceMock.createReceivable).not.toHaveBeenCalled();
  });

  it('should throw if paymentMethodId is missing and receival are true', async () => {
    const receivableData = {
      personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
      userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
      descriptionReceivable: 'Test Receivable 2',
      fixedReceivable: false,
      receivableDate: new Date().getTime(),
      receivalDate: new Date().getTime(),
      receival: true,
      icon: null,
      amount: 200,
      categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      categoryDescription: 'Aluguéis e Rendimentos de Ativos',
      categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
      categoryGroup: CategoryGroupEnum.REVENUES,
      paymentMethodId: undefined,
      paymentMethodDescription: 'Pix',
      paymmentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      createdAt: new Date().getTime(),
    };

    validateCategoryPaymentMethodUseCase.execute = jest
      .fn()
      .mockResolvedValue(true);

    const error = await createReceivableUseCase
      .execute({ receivableData, userId: userIdMock })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INFORME_PAYMENT_METHOD,
      statusCode: 400,
    });

    expect(receivableServiceMock.createReceivable).not.toHaveBeenCalled();
  });
});
