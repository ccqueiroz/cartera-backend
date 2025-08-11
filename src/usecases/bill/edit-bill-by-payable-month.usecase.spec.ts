import { EditBillByPayableMonthUseCase } from './edit-bill-by-payable-month.usecase';
import { ValidateCategoryPaymentMethodUseCase } from '../validate_entities/validate-category-payment-method.usecase';
import { CategoryServiceGateway } from '@/domain/Category/gateway/category.service.gateway';
import { PaymentMethodServiceGateway } from '@/domain/Payment_Method/gateway/payment-method.service.gateway';
import { ApiError } from '@/helpers/errors';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { BillServiceGateway } from '@/domain/Bill/gateway/bill.service.gateway';
import { CategoryDescriptionEnum } from '@/domain/Category/enums/category-description.enum';
import { CategoryGroupEnum } from '@/domain/Category/enums/category-group.enum';
import { PaymentStatusDescriptionEnum } from '@/domain/Payment_Status/enum/payment-status-description.enum';
import { PaymentMethodDescriptionEnum } from '@/domain/Payment_Method/enums/payment-method-description.enum';
import { CategoryType } from '@/domain/Category/enums/category-type.enum';

const userIdMock = '1234567d';

let billServiceMock: jest.Mocked<BillServiceGateway>;
let categoryServiceGatewayMock: jest.Mocked<CategoryServiceGateway>;
let paymentMethodServiceGatewayMock: jest.Mocked<PaymentMethodServiceGateway>;

let validateCategoryPaymentMethodService: ValidateCategoryPaymentMethodUseCase;
let useCase: EditBillByPayableMonthUseCase;

const billObject = {
  id: '121377d92-1aee-4479-859b-72f01c9ade24',
  personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
  userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
  descriptionBill: 'Supermercado',
  categoryDescriptionEnum: CategoryDescriptionEnum.SUPERMARKET,
  fixedBill: false,
  billDate: new Date().getTime(),
  payDate: null,
  payOut: false,
  icon: null,
  amount: 1200.0,
  paymentStatus: PaymentStatusDescriptionEnum.PAID,
  paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
  isPaymentCardBill: false,
  isShoppingListBill: true,
  createdAt: new Date().getTime(),
  updatedAt: null,
};

const complementBillToCallFunction = {
  categoryDescriptionEnum: CategoryDescriptionEnum.SUPERMARKET,
  categoryGroup: CategoryGroupEnum.SHOPPING,
  categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
  categoryDescription: 'Supermercado',
  paymentMethodId: 'g12c3e1b2-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
  paymentMethodDescription: 'Pix',
  paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
};

describe('EditBillByPayableMonthUseCase', () => {
  beforeEach(() => {
    billServiceMock = {
      getBillById: jest.fn(),
      updateBill: jest.fn(),
    } as any;

    categoryServiceGatewayMock = {
      getCategories: jest.fn(),
    } as any;

    paymentMethodServiceGatewayMock = {
      getPaymentMethods: jest.fn(),
    } as any;

    validateCategoryPaymentMethodService =
      ValidateCategoryPaymentMethodUseCase.create({
        categoryService: categoryServiceGatewayMock,
        paymentMethodService: paymentMethodServiceGatewayMock,
      });

    useCase = EditBillByPayableMonthUseCase.create({
      billService: billServiceMock,
      validateCategoryPaymentMethodService,
    });
  });

  it('should update bill when input is valid', async () => {
    billServiceMock.getBillById.mockResolvedValue({
      ...billObject,
      ...complementBillToCallFunction,
      updatedAt: null,
    });

    validateCategoryPaymentMethodService.execute = jest.fn().mockResolvedValue({
      isValidEntities: true,
      category: {
        id: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
        description: 'Supermercado',
        descriptionEnum: CategoryDescriptionEnum.SUPERMARKET,
        group: CategoryGroupEnum.SHOPPING,
        type: CategoryType.BILLS,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      paymentMethod: {
        id: 'g12c3e1b2-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
        description: 'Pix',
        descriptionEnum: PaymentMethodDescriptionEnum.PIX,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    });

    billServiceMock.updateBill.mockResolvedValue({
      ...billObject,
      ...complementBillToCallFunction,
      payOut: true,
      updatedAt: Date.now(),
    });

    const result = await useCase.execute({
      billId: billObject.id,
      billData: {
        payOut: true,
        payDate: Date.now(),
        paymentMethodDescriptionEnum: billObject.paymentMethodDescriptionEnum,
      },
      userId: userIdMock,
    });

    expect(result.data!.id).toBe(billObject.id);
    expect(billServiceMock.updateBill).toHaveBeenCalled();
  });

  it('should throw if userId is missing', async () => {
    const error = await useCase
      .execute({
        billId: billObject.id,
        billData: {
          payOut: true,
          payDate: Date.now(),
          paymentMethodDescriptionEnum: billObject.paymentMethodDescriptionEnum,
        },
        userId: '',
      })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_CREDENTIALS,
      statusCode: 401,
    });
  });

  it('should throw if billId is missing', async () => {
    const error = await useCase
      .execute({
        billId: '',
        billData: {
          payOut: true,
          payDate: Date.now(),
          paymentMethodDescriptionEnum: billObject.paymentMethodDescriptionEnum,
        },
        userId: userIdMock,
      })
      .catch((err) => err);

    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS,
      statusCode: 400,
    });
  });

  it('should throw if bill not found', async () => {
    billServiceMock.getBillById.mockResolvedValue(null);

    const error = await useCase
      .execute({
        billId: billObject.id,
        billData: {
          payOut: true,
          payDate: Date.now(),
          paymentMethodDescriptionEnum: billObject.paymentMethodDescriptionEnum,
        },
        userId: userIdMock,
      })
      .catch((err) => err);

    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.BILL_NOT_FOUND,
      statusCode: 404,
    });
  });

  it('should throw if bill already paid', async () => {
    billServiceMock.getBillById.mockResolvedValue({
      ...billObject,
      ...complementBillToCallFunction,
      payOut: true,
      updatedAt: null,
    });

    const error = await useCase
      .execute({
        billId: billObject.id,
        billData: {
          payOut: true,
          payDate: Date.now(),
          paymentMethodDescriptionEnum: billObject.paymentMethodDescriptionEnum,
        },
        userId: userIdMock,
      })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe(
      `Conta "${billObject.descriptionBill}" já foi paga. Para alterar os status da conta. Por favor, Acesse a sessão de "Pagamentos".`,
    );
  });

  it('should throw if payDate is missing', async () => {
    billServiceMock.getBillById.mockResolvedValue({
      ...billObject,
      ...complementBillToCallFunction,
      updatedAt: null,
    });

    const error = await useCase
      .execute({
        billId: billObject.id,
        billData: {
          payOut: true,
          payDate: undefined as any,
          paymentMethodDescriptionEnum: billObject.paymentMethodDescriptionEnum,
        },
        userId: userIdMock,
      })
      .catch((err) => err);

    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INFORME_PAY_DATE_BILL,
      statusCode: 400,
    });
  });

  it('should throw if payDate is before createdAt', async () => {
    const createdAt = Date.now();
    const payDate = createdAt - 1000;

    billServiceMock.getBillById.mockResolvedValue({
      ...billObject,
      ...complementBillToCallFunction,
      createdAt,
      updatedAt: null,
    });

    const error = await useCase
      .execute({
        billId: billObject.id,
        billData: {
          payOut: true,
          payDate,
          paymentMethodDescriptionEnum: billObject.paymentMethodDescriptionEnum,
        },
        userId: userIdMock,
      })
      .catch((err) => err);

    expect(convertOutputErrorToObject(error)).toEqual({
      message:
        ERROR_MESSAGES.BILL_PAY_DATE_CANNOT_BE_PRIOR_THE_ACCOUNT_CREATE_DATE,
      statusCode: 400,
    });
  });

  it('should throw if validateCategoryPaymentMethodService returns false', async () => {
    billServiceMock.getBillById.mockResolvedValue({
      ...billObject,
      ...complementBillToCallFunction,
      payDate: null,
      payOut: false,
      updatedAt: null,
    });

    (validateCategoryPaymentMethodService.execute as jest.Mock) = jest
      .fn()
      .mockResolvedValue(false);

    const error = await useCase
      .execute({
        billId: billObject.id,
        billData: {
          payOut: true,
          payDate: Date.now(),
          paymentMethodDescriptionEnum: billObject.paymentMethodDescriptionEnum,
        },
        userId: userIdMock,
      })
      .catch((err) => err);

    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_CATEGORY_OR_PAYMENT_METHOD,
      statusCode: 400,
    });
  });
});
