import { ValidateCategoryPaymentMethodUseCase } from '../validate_entities/validate-category-payment-method.usecase';
import { CategoryServiceGateway } from '@/domain/Category/gateway/category.service.gateway';
import { PaymentMethodServiceGateway } from '@/domain/Payment_Method/gateway/payment-method.service.gateway';
import { EditReceivableUseCase } from './edit-receivable.usecase';
import { ApiError } from '@/helpers/errors';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { ReceivableServiceGateway } from '@/domain/Receivable/gateway/receivable.service.gateway';
import { CategoryDescriptionEnum } from '@/domain/Category/enums/category-description.enum';
import { CategoryGroupEnum } from '@/domain/Category/enums/category-group.enum';
import { PaymentMethodDescriptionEnum } from '@/domain/Payment_Method/enums/payment-method-description.enum';
import { PaymentStatusDescriptionEnum } from '@/domain/Payment_Status/enum/payment-status-description.enum';
import { CategoryType } from '@/domain/Category/enums/category-type.enum';

let receivableServiceMock: jest.Mocked<ReceivableServiceGateway>;

let editReceivableUseCase: EditReceivableUseCase;

let categoryServiceGatewayMock: jest.Mocked<CategoryServiceGateway>;
let paymentMethodServiceGatewayMock: jest.Mocked<PaymentMethodServiceGateway>;

let validateCategoryPaymentMethodServiceMock: ValidateCategoryPaymentMethodUseCase;

const userIdMock = '1234567d';

describe('EditReceivableUseCase', () => {
  beforeEach(() => {
    receivableServiceMock = {
      getReceivableById: jest.fn(),
      updateReceivable: jest.fn(),
    } as any;

    categoryServiceGatewayMock = {
      getCategories: jest.fn(),
    } as any;

    paymentMethodServiceGatewayMock = {
      getPaymentMethods: jest.fn(),
    } as any;

    validateCategoryPaymentMethodServiceMock =
      ValidateCategoryPaymentMethodUseCase.create({
        categoryService: categoryServiceGatewayMock,
        paymentMethodService: paymentMethodServiceGatewayMock,
      });

    editReceivableUseCase = EditReceivableUseCase.create({
      receivableService: receivableServiceMock,
      validateCategoryPaymentMethodService:
        validateCategoryPaymentMethodServiceMock,
    });
  });

  it('should be create a instance of the EditReceivableUseCase class when will be use create method.', () => {
    expect(editReceivableUseCase).toBeInstanceOf(EditReceivableUseCase);
  });

  it('should edit a receivable when valid data and receivable id are provided', async () => {
    const receivableData = {
      id: 'b2c3d4e5-f6a1-8901-2345-67890abcde12',
      personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
      userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
      descriptionReceivable: 'Test Receivable 2',
      fixedReceivable: false,
      receivableDate: new Date().getTime(),
      receivalDate: new Date().getTime(),
      receival: true,
      icon: null,
      amount: 200,
      categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      createdAt: new Date().getTime(),
      updatedAt: null,
    };

    const complementBillToCallFunction = {
      categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
      categoryGroup: CategoryGroupEnum.REVENUES,
      categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      categoryDescription: 'Aluguéis e Rendimentos de Ativos',
      paymentMethodId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      paymentMethodDescription: 'Pix',
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
    };

    receivableServiceMock.getReceivableById.mockResolvedValue({
      ...receivableData,
      ...complementBillToCallFunction,
      updatedAt: null,
    });

    validateCategoryPaymentMethodServiceMock.execute = jest
      .fn()
      .mockResolvedValue({
        isValidEntities: true,
        category: {
          id: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
          description: 'Aluguéis e Rendimentos de Ativos',
          descriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
          group: CategoryGroupEnum.REVENUES,
          type: CategoryType.RECEIVABLE,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        paymentMethod: {
          id: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
          description: 'Pix',
          descriptionEnum: PaymentMethodDescriptionEnum.PIX,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      });

    receivableServiceMock.updateReceivable.mockResolvedValue({
      ...receivableData,
      descriptionReceivable: 'Test Receivable updated',
      ...complementBillToCallFunction,
      updatedAt: new Date().getTime(),
    });

    const result = await editReceivableUseCase.execute({
      receivableId: receivableData.id,
      receivableData,
      userId: userIdMock,
    });

    expect(result.data?.id).toBe(receivableData.id);
    expect(receivableServiceMock.updateReceivable).toHaveBeenCalledWith({
      receivableId: receivableData.id,
      receivableData: {
        ...receivableData,
        ...complementBillToCallFunction,
      },
      userId: userIdMock,
    });
    expect(result.data?.updatedAt).toEqual(expect.any(Number));
  });

  it('should throw an error if the category, payment method, or payment status is invalid.', async () => {
    const receivableData = {
      id: 'b2c3d4e5-f6a1-8901-2345-67890abcde12',
      personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
      userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
      descriptionReceivable: 'Test Receivable 2',
      fixedReceivable: false,
      receivableDate: new Date().getTime(),
      receivalDate: new Date().getTime(),
      receival: true,
      icon: null,
      amount: 200,
      categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      createdAt: new Date().getTime(),
      updatedAt: null,
    };

    const complementBillToCallFunction = {
      categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
      categoryGroup: CategoryGroupEnum.REVENUES,
      categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      categoryDescription: 'Aluguéis e Rendimentos de Ativos',
      paymentMethodId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      paymentMethodDescription: 'Pix',
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
    };

    receivableServiceMock.getReceivableById.mockResolvedValue({
      ...receivableData,
      ...complementBillToCallFunction,
      updatedAt: null,
    });

    validateCategoryPaymentMethodServiceMock.execute = jest
      .fn()
      .mockResolvedValue({
        isValidEntities: false,
        category: {
          id: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
          description: 'Aluguéis e Rendimentos de Ativos',
          descriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
          group: CategoryGroupEnum.REVENUES,
          type: CategoryType.RECEIVABLE,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        paymentMethod: {
          id: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
          description: 'Pix',
          descriptionEnum: PaymentMethodDescriptionEnum.PIX,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      });

    const error = await editReceivableUseCase
      .execute({
        receivableId: receivableData.id,
        receivableData,
        userId: userIdMock,
      })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_CATEGORY_OR_PAYMENT_METHOD,
      statusCode: 400,
    });
    expect(receivableServiceMock.updateReceivable).not.toHaveBeenCalled();
  });

  it('should throw an error if receivableId is not exist in data base.', async () => {
    const receivableData = {
      id: 'b2c3d4e5-f6a1-8901-2345-67890abcde12',
      personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
      userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
      descriptionReceivable: 'Test Receivable 2',
      fixedReceivable: false,
      receivableDate: new Date().getTime(),
      receivalDate: new Date().getTime(),
      receival: true,
      icon: null,
      amount: 200,
      categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      createdAt: new Date().getTime(),
      updatedAt: null,
    };

    receivableServiceMock.getReceivableById.mockResolvedValue(null);

    const error = await editReceivableUseCase
      .execute({
        receivableId: receivableData.id,
        receivableData,
        userId: userIdMock,
      })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.RECEIVABLE_NOT_FOUND,
      statusCode: 404,
    });
    expect(receivableServiceMock.updateReceivable).not.toHaveBeenCalled();
  });

  it('should throw an error if receivableId is invalid', async () => {
    const receivableData = {
      id: 'b2c3d4e5-f6a1-8901-2345-67890abcde12',
      personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
      userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
      descriptionReceivable: 'Test Receivable 2',
      fixedReceivable: false,
      receivableDate: new Date().getTime(),
      receivalDate: new Date().getTime(),
      receival: true,
      icon: null,
      amount: 200,
      categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      createdAt: new Date().getTime(),
      updatedAt: null,
    };

    const error = await editReceivableUseCase
      .execute({
        receivableId: '',
        receivableData,
        userId: userIdMock,
      })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS,
      statusCode: 400,
    });
    expect(receivableServiceMock.updateReceivable).not.toHaveBeenCalled();
  });

  it('should be throw an error if the userId does not passed', async () => {
    const receivableData = {
      id: 'b2c3d4e5-f6a1-8901-2345-67890abcde12',
      personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
      userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
      descriptionReceivable: 'Test Receivable 2',
      fixedReceivable: false,
      receivableDate: new Date().getTime(),
      receivalDate: new Date().getTime(),
      receival: true,
      icon: null,
      amount: 200,
      categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      createdAt: new Date().getTime(),
      updatedAt: null,
    };

    const error = await editReceivableUseCase
      .execute({ receivableId: '', receivableData, userId: '' })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_CREDENTIALS,
      statusCode: 401,
    });

    expect(receivableServiceMock.updateReceivable).not.toHaveBeenCalled();
  });

  it('should throw if receivalDate is missing and receival are true', async () => {
    const receivableData = {
      id: 'b2c3d4e5-f6a1-8901-2345-67890abcde12',
      personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
      userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
      descriptionReceivable: 'Test Receivable 2',
      fixedReceivable: false,
      receivableDate: new Date().getTime(),
      receivalDate: null,
      receival: true,
      icon: null,
      amount: 200,
      categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      createdAt: new Date().getTime(),
      updatedAt: null,
    };

    const complementBillToCallFunction = {
      categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
      categoryGroup: CategoryGroupEnum.REVENUES,
      categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      categoryDescription: 'Aluguéis e Rendimentos de Ativos',
      paymentMethodId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      paymentMethodDescription: 'Pix',
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
    };

    receivableServiceMock.getReceivableById.mockResolvedValue({
      ...receivableData,
      ...complementBillToCallFunction,
    });

    validateCategoryPaymentMethodServiceMock.execute = jest
      .fn()
      .mockResolvedValue({
        isValidEntities: false,
        category: {
          id: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
          description: 'Aluguéis e Rendimentos de Ativos',
          descriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
          group: CategoryGroupEnum.REVENUES,
          type: CategoryType.RECEIVABLE,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        paymentMethod: {
          id: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
          description: 'Pix',
          descriptionEnum: PaymentMethodDescriptionEnum.PIX,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      });

    const error = await editReceivableUseCase
      .execute({
        receivableId: receivableData.id,
        receivableData,
        userId: userIdMock,
      })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INFORME_PAY_DATE_BILL,
      statusCode: 400,
    });

    expect(receivableServiceMock.updateReceivable).not.toHaveBeenCalled();
  });

  it('should throw if paymentMethodId is missing and receival are true', async () => {
    const receivableData = {
      id: 'b2c3d4e5-f6a1-8901-2345-67890abcde12',
      personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
      userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
      descriptionReceivable: 'Test Receivable 2',
      fixedReceivable: false,
      receivableDate: new Date().getTime(),
      receivalDate: new Date().getTime(),
      receival: true,
      icon: null,
      amount: 200,
      categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      createdAt: new Date().getTime(),
      updatedAt: null,
    };

    const complementBillToCallFunction = {
      categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
      categoryGroup: CategoryGroupEnum.REVENUES,
      categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      categoryDescription: 'Aluguéis e Rendimentos de Ativos',
      paymentMethodId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      paymentMethodDescription: 'Pix',
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
    };

    receivableServiceMock.getReceivableById.mockResolvedValue({
      ...receivableData,
      ...complementBillToCallFunction,
    });

    validateCategoryPaymentMethodServiceMock.execute = jest
      .fn()
      .mockResolvedValue({
        isValidEntities: false,
        category: {
          id: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
          description: 'Aluguéis e Rendimentos de Ativos',
          descriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
          group: CategoryGroupEnum.REVENUES,
          type: CategoryType.RECEIVABLE,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        paymentMethod: {
          id: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
          description: 'Pix',
          descriptionEnum: PaymentMethodDescriptionEnum.PIX,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      });

    const error = await editReceivableUseCase
      .execute({
        receivableId: receivableData.id,
        receivableData,
        userId: userIdMock,
      })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INFORME_PAYMENT_METHOD,
      statusCode: 400,
    });

    expect(receivableServiceMock.updateReceivable).not.toHaveBeenCalled();
  });
});
