import { ValidateCategoryPaymentMethodUseCase } from '../validate_entities/validate-category-payment-method.usecase';
import { CreateBillUseCase } from './create-bill.usecase';
import { ApiError } from '@/helpers/errors';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { CategoryServiceGateway } from '@/domain/Category/gateway/category.service.gateway';
import { PaymentMethodServiceGateway } from '@/domain/Payment_Method/gateway/payment-method.service.gateway';
import { BillServiceGateway } from '@/domain/Bill/gateway/bill.service.gateway';
import { CategoryDescriptionEnum } from '@/domain/Category/enums/category-description.enum';
import { CategoryGroupEnum } from '@/domain/Category/enums/category-group.enum';
import { PaymentStatusDescriptionEnum } from '@/domain/Payment_Status/enum/payment-status-description.enum';
import { PaymentMethodDescriptionEnum } from '@/domain/Payment_Method/enums/payment-method-description.enum';
import { CategoryType } from '@/domain/Category/enums/category-type.enum';

const userIdMock = '1234567d';

let billServiceMock: jest.Mocked<BillServiceGateway>;

let createBillUseCase: CreateBillUseCase;

let categoryServiceGatewayMock: jest.Mocked<CategoryServiceGateway>;
let paymentMethodServiceGatewayMock: jest.Mocked<PaymentMethodServiceGateway>;

let validateCategoryPaymentMethodService: ValidateCategoryPaymentMethodUseCase;
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

    validateCategoryPaymentMethodService =
      ValidateCategoryPaymentMethodUseCase.create({
        categoryService: categoryServiceGatewayMock,
        paymentMethodService: paymentMethodServiceGatewayMock,
      });

    createBillUseCase = CreateBillUseCase.create({
      billService: billServiceMock,
      validateCategoryPaymentMethodService:
        validateCategoryPaymentMethodService,
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
      descriptionBill: 'Supermercado',
      categoryDescriptionEnum: CategoryDescriptionEnum.SUPERMARKET,
      fixedBill: false,
      billDate: new Date().getTime(),
      payDate: new Date().getTime(),
      payOut: true,
      icon: null,
      amount: 1200.0,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      isPaymentCardBill: false,
      isShoppingListBill: true,
      createdAt: new Date().getTime(),
    };

    const bill = {
      id: 'd41d8cd98f00b204e9800998ecf8427e',
    };

    billServiceMock.createBill.mockResolvedValue({
      id: 'd41d8cd98f00b204e9800998ecf8427e',
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

    const complementBillToCallFunction = {
      categoryDescriptionEnum: CategoryDescriptionEnum.SUPERMARKET,
      categoryGroup: CategoryGroupEnum.SHOPPING,
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Supermercado',
      paymentMethodId: 'g12c3e1b2-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
    };

    const result = await createBillUseCase.execute({
      billData: billObject,
      userId: userIdMock,
    });

    expect(result.data).not.toBeNull();

    expect(result.data?.id).toBe(bill.id);
    expect(billServiceMock.createBill).toHaveBeenCalledWith({
      billData: {
        ...billObject,
        ...complementBillToCallFunction,
      },
      userId: userIdMock,
    });
  });

  it('should return null if the bill creation fails', async () => {
    const billObject = {
      id: '24177d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Supermercado',
      categoryDescriptionEnum: CategoryDescriptionEnum.SUPERMARKET,
      fixedBill: false,
      billDate: new Date().getTime(),
      payDate: new Date().getTime(),
      payOut: true,
      icon: null,
      amount: 1200.0,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      isPaymentCardBill: false,
      isShoppingListBill: true,
      createdAt: new Date().getTime(),
    };

    billServiceMock.createBill.mockResolvedValue(null);

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

    const complementBillToCallFunction = {
      categoryDescriptionEnum: CategoryDescriptionEnum.SUPERMARKET,
      categoryGroup: CategoryGroupEnum.SHOPPING,
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Supermercado',
      paymentMethodId: 'g12c3e1b2-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
    };

    const result = await createBillUseCase.execute({
      billData: billObject,
      userId: userIdMock,
    });

    expect(result.data).toBeNull();

    expect(billServiceMock.createBill).toHaveBeenCalledWith({
      billData: {
        ...billObject,
        ...complementBillToCallFunction,
      },
      userId: userIdMock,
    });
  });

  it('should be throw an error if the userId does not passed', async () => {
    const billObject = {
      id: '24177d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Supermercado',
      categoryDescriptionEnum: CategoryDescriptionEnum.SUPERMARKET,
      categoryGroup: CategoryGroupEnum.SHOPPING,
      fixedBill: false,
      billDate: new Date().getTime(),
      payDate: new Date().getTime(),
      payOut: true,
      icon: null,
      amount: 1200.0,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Supermercado',
      paymentMethodId: 'g12c3e1b2-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      isPaymentCardBill: false,
      isShoppingListBill: true,
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
      descriptionBill: 'Supermercado',
      categoryDescriptionEnum: CategoryDescriptionEnum.SUPERMARKET,
      fixedBill: false,
      billDate: new Date().getTime(),
      payDate: new Date().getTime(),
      payOut: true,
      icon: null,
      amount: 1200.0,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      isPaymentCardBill: false,
      isShoppingListBill: true,
      createdAt: new Date().getTime(),
    };

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

    const complementBillToCallFunction = {
      categoryDescriptionEnum: CategoryDescriptionEnum.SUPERMARKET,
      categoryGroup: CategoryGroupEnum.SHOPPING,
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Supermercado',
      paymentMethodId: 'g12c3e1b2-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
    };

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
      billData: {
        ...billObject,
        ...complementBillToCallFunction,
      },
      userId: userIdMock,
    });
  });

  it('should throw if payDate is missing and payout are true', async () => {
    const billObject = {
      id: '121377d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Supermercado',
      categoryDescriptionEnum: CategoryDescriptionEnum.SUPERMARKET,
      categoryGroup: CategoryGroupEnum.SHOPPING,
      fixedBill: false,
      billDate: new Date().getTime(),
      payDate: new Date().getTime(),
      payOut: true,
      icon: null,
      amount: 1200.0,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Supermercado',
      paymentMethodId: 'g12c3e1b2-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      isPaymentCardBill: false,
      isShoppingListBill: true,
      createdAt: new Date().getTime(),
      updatedAt: null,
    };

    validateCategoryPaymentMethodService.execute = jest.fn().mockResolvedValue({
      isValidEntities: true,
      category: {
        id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
        description: 'Manutenção Veículo',
        descriptionEnum: CategoryDescriptionEnum.VEHICLE_MAINTENANCE,
        group: CategoryGroupEnum.TRANSPORT,
        type: CategoryType.BILLS,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      paymentMethod: {
        id: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
        description: 'Cartão de Crédito',
        descriptionEnum: PaymentMethodDescriptionEnum.DEBIT_CARD,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    });

    const error = await createBillUseCase
      .execute({
        billData: { ...billObject, payDate: null },
        userId: userIdMock,
      })
      .catch((err) => err);

    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INFORME_PAY_DATE_BILL,
      statusCode: 400,
    });
  });

  it('should throw if paymentMethodId is missing and payout are true', async () => {
    const billObject = {
      id: '121377d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Supermercado',
      categoryDescriptionEnum: CategoryDescriptionEnum.SUPERMARKET,
      categoryGroup: CategoryGroupEnum.SHOPPING,
      fixedBill: false,
      billDate: new Date().getTime(),
      payDate: new Date().getTime(),
      payOut: true,
      icon: null,
      amount: 1200.0,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Supermercado',
      paymentMethodId: 'g12c3e1b2-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      isPaymentCardBill: false,
      isShoppingListBill: true,
      createdAt: new Date().getTime(),
      updatedAt: null,
    };

    validateCategoryPaymentMethodService.execute = jest.fn().mockResolvedValue({
      isValidEntities: true,
      category: {
        id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
        description: 'Manutenção Veículo',
        descriptionEnum: CategoryDescriptionEnum.VEHICLE_MAINTENANCE,
        group: CategoryGroupEnum.TRANSPORT,
        type: CategoryType.BILLS,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      paymentMethod: {
        id: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
        description: 'Cartão de Crédito',
        descriptionEnum: PaymentMethodDescriptionEnum.DEBIT_CARD,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    });

    const error = await createBillUseCase
      .execute({
        billData: { ...billObject, paymentMethodDescriptionEnum: undefined },
        userId: userIdMock,
      })
      .catch((err) => err);

    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INFORME_PAYMENT_METHOD,
      statusCode: 400,
    });
  });
});
