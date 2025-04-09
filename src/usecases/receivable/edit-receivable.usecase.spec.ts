import { ReceivableGateway } from '@/domain/Receivable/gateway/receivable.gateway';
import { ValidateCategoryPaymentMethodStatusUseCase } from '../validate_entities/validate-category-payment-method-status.usecase';
import { CategoryGateway } from '@/domain/Category/gateway/category.gateway';
import { PaymentMethodGateway } from '@/domain/Payment_Method/gateway/payment-method.gateway';
import { PaymentStatusGateway } from '@/domain/Payment_Status/gateway/payment-status.gateway';
import { EditReceivableUseCase } from './edit-receivable.usecase';
import { ApiError } from '@/helpers/errors';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';

let receivableGatewayMock: jest.Mocked<ReceivableGateway>;

let editReceivableUseCase: EditReceivableUseCase;

let categoryGatewayMock: jest.Mocked<CategoryGateway>;
let paymentMethodGatewayMock: jest.Mocked<PaymentMethodGateway>;
let paymentStatusGatewayMock: jest.Mocked<PaymentStatusGateway>;

let validateCategoryPaymentMethodStatusUseCase: ValidateCategoryPaymentMethodStatusUseCase;

const userIdMock = '1234567d';

describe('EditReceivableUseCase', () => {
  beforeEach(() => {
    receivableGatewayMock = {
      getReceivableById: jest.fn(),
      updateReceivable: jest.fn(),
    } as any;

    categoryGatewayMock = {
      getCategoryById: jest.fn(),
    } as any;

    paymentMethodGatewayMock = {
      getPaymentMethodById: jest.fn(),
    } as any;

    paymentStatusGatewayMock = {
      getPaymentStatusById: jest.fn(),
    } as any;

    validateCategoryPaymentMethodStatusUseCase =
      ValidateCategoryPaymentMethodStatusUseCase.create({
        categoryGateway: categoryGatewayMock,
        paymentMethodGateway: paymentMethodGatewayMock,
        paymentStatusGateway: paymentStatusGatewayMock,
      });

    editReceivableUseCase = EditReceivableUseCase.create({
      receivableGateway: receivableGatewayMock,
      validateCategoryPaymentMethodStatusService:
        validateCategoryPaymentMethodStatusUseCase,
    });
  });

  it('should be create a instance of the EditReceivableUseCase class when will be use create method.', () => {
    expect(editReceivableUseCase).toBeInstanceOf(EditReceivableUseCase);
  });

  it('should edit a receivable when valid data and receivable id are provided', async () => {
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
      updatedAt: null,
    };

    receivableGatewayMock.getReceivableById.mockResolvedValue({
      ...receivableData,
      updatedAt: null,
    });

    validateCategoryPaymentMethodStatusUseCase.execute = jest
      .fn()
      .mockResolvedValue(true);

    receivableGatewayMock.updateReceivable.mockResolvedValue({
      ...receivableData,
      descriptionReceivable: 'Test Receivable updated',
      updatedAt: new Date().getTime(),
    });

    const result = await editReceivableUseCase.execute({
      receivableId: receivableData.id,
      receivableData,
      userId: userIdMock,
    });

    expect(result.data?.id).toBe(receivableData.id);
    expect(receivableGatewayMock.updateReceivable).toHaveBeenCalledWith({
      receivableId: receivableData.id,
      receivableData,
      userId: userIdMock,
    });
    expect(result.data?.updatedAt).toEqual(expect.any(Number));
  });

  it('should throw an error if the category, payment method, or payment status is invalid.', async () => {
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
      updatedAt: null,
    };

    receivableGatewayMock.getReceivableById.mockResolvedValue({
      ...receivableData,
      updatedAt: null,
    });

    validateCategoryPaymentMethodStatusUseCase.execute = jest
      .fn()
      .mockResolvedValue(false);

    const error = await editReceivableUseCase
      .execute({
        receivableId: receivableData.id,
        receivableData,
        userId: userIdMock,
      })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_CATEGORY_PAYMENT_METHOD_OR_PAYMENT_STATUS,
      statusCode: 400,
    });
    expect(receivableGatewayMock.updateReceivable).not.toHaveBeenCalled();
  });

  it('should throw an error if receivableId is not exist in data base.', async () => {
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
      updatedAt: null,
    };

    receivableGatewayMock.getReceivableById.mockResolvedValue(null);

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
    expect(receivableGatewayMock.updateReceivable).not.toHaveBeenCalled();
  });

  it('should throw an error if receivableId is invalid', async () => {
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
    expect(receivableGatewayMock.updateReceivable).not.toHaveBeenCalled();
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

    expect(receivableGatewayMock.updateReceivable).not.toHaveBeenCalled();
  });
});
