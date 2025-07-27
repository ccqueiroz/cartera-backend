import { BillDTO } from '@/domain/Bill/dtos/bill.dto';
import { BillServiceGateway } from '@/domain/Bill/gateway/bill.service.gateway';
import { CategoryDescriptionEnum } from '@/domain/Category/enums/category-description.enum';
import { CategoryGroupEnum } from '@/domain/Category/enums/category-group.enum';
import { PaymentMethodDescriptionEnum } from '@/domain/Payment_Method/enums/payment-method-description.enum';
import { PaymentStatusDescriptionEnum } from '@/domain/Payment_Status/enum/payment-status-description.enum';
import { ReceivableServiceGateway } from '@/domain/Receivable/gateway/receivable.service.gateway';
import { GetInvoicesByCategoriesAndByPeriodUseCase } from './get-invoices-by-categories-and-by-period.usecase';
import { ResponseListDTO } from '@/domain/dtos/responseListDto.dto';
import { CategoryType } from '@/domain/Category/enums/category-type.enum';
import { ApiError } from '@/helpers/errors';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { ReceivableDTO } from '@/domain/Receivable/dtos/receivable.dto';

const billInvoiceMock: ResponseListDTO<BillDTO> = {
  content: [
    {
      id: '121377d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Supermercado',
      categoryDescriptionEnum: CategoryDescriptionEnum.BLABLACAR,
      categoryGroup: CategoryGroupEnum.MOBILITY_BY_APP,
      fixedBill: false,
      billDate: new Date('2025-07-26').getTime(),
      payDate: new Date('2025-07-26').getTime(),
      payOut: false,
      icon: null,
      amount: 1200.0,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'BlaBlaCar',
      paymentMethodId: 'g12c3e1b2-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      isPaymentCardBill: false,
      isShoppingListBill: true,
      createdAt: new Date('2025-07-26').getTime(),
      updatedAt: null,
    },
    {
      id: '121377d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Supermercado',
      categoryDescriptionEnum: CategoryDescriptionEnum.SUPERMARKET,
      categoryGroup: CategoryGroupEnum.SHOPPING,
      fixedBill: false,
      billDate: new Date('2025-07-26').getTime(),
      payDate: new Date('2025-07-26').getTime(),
      payOut: false,
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
      createdAt: new Date('2025-07-26').getTime(),
      updatedAt: null,
    },
    {
      id: '121377d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Supermercado',
      categoryDescriptionEnum: CategoryDescriptionEnum.SUPERMARKET,
      categoryGroup: CategoryGroupEnum.SHOPPING,
      fixedBill: false,
      billDate: new Date('2025-07-06').getTime(),
      payDate: new Date('2025-07-06').getTime(),
      payOut: false,
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
      createdAt: new Date('2025-07-06').getTime(),
      updatedAt: null,
    },
    {
      id: '121377d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Supermercado',
      categoryDescriptionEnum: CategoryDescriptionEnum['99POP'],
      categoryGroup: CategoryGroupEnum.MOBILITY_BY_APP,
      fixedBill: false,
      billDate: new Date('2025-07-16').getTime(),
      payDate: new Date('2025-07-16').getTime(),
      payOut: false,
      icon: null,
      amount: 56.93,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: '99 Pop',
      paymentMethodId: 'g12c3e1b2-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      isPaymentCardBill: false,
      isShoppingListBill: true,
      createdAt: new Date('2025-07-16').getTime(),
      updatedAt: null,
    },
    {
      id: '121377d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Supermercado',
      categoryDescriptionEnum: CategoryDescriptionEnum.GYM,
      categoryGroup: CategoryGroupEnum.HEALTH_AND_WELL_BEING,
      fixedBill: false,
      billDate: new Date('2025-07-16').getTime(),
      payDate: new Date('2025-07-16').getTime(),
      payOut: false,
      icon: null,
      amount: 220.0,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Academia',
      paymentMethodId: 'g12c3e1b2-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      isPaymentCardBill: false,
      isShoppingListBill: true,
      createdAt: new Date('2025-07-16').getTime(),
      updatedAt: null,
    },
    {
      id: '121377d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Supermercado',
      categoryDescriptionEnum: CategoryDescriptionEnum.RENT,
      categoryGroup: CategoryGroupEnum.HOUSING,
      fixedBill: false,
      billDate: new Date('2025-07-16').getTime(),
      payDate: new Date('2025-07-16').getTime(),
      payOut: false,
      icon: null,
      amount: 2250.99,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Aluguel',
      paymentMethodId: 'g12c3e1b2-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      isPaymentCardBill: false,
      isShoppingListBill: true,
      createdAt: new Date('2025-07-16').getTime(),
      updatedAt: null,
    },
    {
      id: '121377d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Supermercado',
      categoryDescriptionEnum: CategoryDescriptionEnum.VEHICLE_CREDIT_LINE,
      categoryGroup: CategoryGroupEnum.FINANCING,
      fixedBill: false,
      billDate: new Date('2025-07-16').getTime(),
      payDate: new Date('2025-07-16').getTime(),
      payOut: false,
      icon: null,
      amount: 1247.9,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Carta de Crédito de Veículo',
      paymentMethodId: 'g12c3e1b2-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      isPaymentCardBill: false,
      isShoppingListBill: true,
      createdAt: new Date('2025-07-16').getTime(),
      updatedAt: null,
    },
  ],
  ordering: null,
  page: 0,
  size: 10,
  totalElements: 7,
  totalPages: 1,
};

const receivablesInvoiceMock: ResponseListDTO<ReceivableDTO> = {
  content: [
    {
      id: '121377d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionReceivable: 'Supermercado',
      categoryDescriptionEnum: CategoryDescriptionEnum.BLABLACAR,
      categoryGroup: CategoryGroupEnum.MOBILITY_BY_APP,
      fixedReceivable: false,
      receivableDate: new Date('2025-07-26').getTime(),
      receivalDate: new Date('2025-07-26').getTime(),
      receival: false,
      icon: null,
      amount: 1200.0,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'BlaBlaCar',
      paymentMethodId: 'g12c3e1b2-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      createdAt: new Date('2025-07-26').getTime(),
      updatedAt: null,
    },
    {
      id: '121377d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionReceivable: 'Supermercado',
      categoryDescriptionEnum: CategoryDescriptionEnum.SUPERMARKET,
      categoryGroup: CategoryGroupEnum.SHOPPING,
      fixedReceivable: false,
      receivableDate: new Date('2025-07-26').getTime(),
      receivalDate: new Date('2025-07-26').getTime(),
      receival: false,
      icon: null,
      amount: 1200.0,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Supermercado',
      paymentMethodId: 'g12c3e1b2-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      createdAt: new Date('2025-07-26').getTime(),
      updatedAt: null,
    },
    {
      id: '121377d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionReceivable: 'Supermercado',
      categoryDescriptionEnum: CategoryDescriptionEnum.SUPERMARKET,
      categoryGroup: CategoryGroupEnum.SHOPPING,
      fixedReceivable: false,
      receivableDate: new Date('2025-07-06').getTime(),
      receivalDate: new Date('2025-07-06').getTime(),
      receival: false,
      icon: null,
      amount: 1200.0,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Supermercado',
      paymentMethodId: 'g12c3e1b2-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      createdAt: new Date('2025-07-06').getTime(),
      updatedAt: null,
    },
    {
      id: '121377d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionReceivable: 'Supermercado',
      categoryDescriptionEnum: CategoryDescriptionEnum['99POP'],
      categoryGroup: CategoryGroupEnum.MOBILITY_BY_APP,
      fixedReceivable: false,
      receivableDate: new Date('2025-07-16').getTime(),
      receivalDate: new Date('2025-07-16').getTime(),
      receival: false,
      icon: null,
      amount: 56.93,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: '99 Pop',
      paymentMethodId: 'g12c3e1b2-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      createdAt: new Date('2025-07-16').getTime(),
      updatedAt: null,
    },
    {
      id: '121377d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionReceivable: 'Supermercado',
      categoryDescriptionEnum: CategoryDescriptionEnum.GYM,
      categoryGroup: CategoryGroupEnum.HEALTH_AND_WELL_BEING,
      fixedReceivable: false,
      receivableDate: new Date('2025-07-16').getTime(),
      receivalDate: new Date('2025-07-16').getTime(),
      receival: false,
      icon: null,
      amount: 220.0,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Academia',
      paymentMethodId: 'g12c3e1b2-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      createdAt: new Date('2025-07-16').getTime(),
      updatedAt: null,
    },
    {
      id: '121377d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionReceivable: 'Supermercado',
      categoryDescriptionEnum: CategoryDescriptionEnum.RENT,
      categoryGroup: CategoryGroupEnum.HOUSING,
      fixedReceivable: false,
      receivableDate: new Date('2025-07-16').getTime(),
      receivalDate: new Date('2025-07-16').getTime(),
      receival: false,
      icon: null,
      amount: 2250.99,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Aluguel',
      paymentMethodId: 'g12c3e1b2-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      createdAt: new Date('2025-07-16').getTime(),
      updatedAt: null,
    },
    {
      id: '121377d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionReceivable: 'Supermercado',
      categoryDescriptionEnum: CategoryDescriptionEnum.VEHICLE_CREDIT_LINE,
      categoryGroup: CategoryGroupEnum.FINANCING,
      fixedReceivable: false,
      receivableDate: new Date('2025-07-16').getTime(),
      receivalDate: new Date('2025-07-16').getTime(),
      receival: false,
      icon: null,
      amount: 1247.9,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Carta de Crédito de Veículo',
      paymentMethodId: 'g12c3e1b2-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      createdAt: new Date('2025-07-16').getTime(),
      updatedAt: null,
    },
  ],
  ordering: null,
  page: 0,
  size: 10,
  totalElements: 7,
  totalPages: 1,
};

let billServiceMock: jest.Mocked<BillServiceGateway>;
let receivableServiceMock: jest.Mocked<ReceivableServiceGateway>;
let getInvoicesByCategoryAndByPeriodMock: GetInvoicesByCategoriesAndByPeriodUseCase;

const userIdMock = '1234567d';

describe('GetInvoicesByCategoriesAndByPeriod', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    billServiceMock = {
      handleQueryBillsByFilters: jest.fn(),
      totalAmountBills: jest.fn(),
    } as any;

    receivableServiceMock = {
      handleQueryReceivablesByFilters: jest.fn(),
      totalAmountReceivables: jest.fn(),
    } as any;

    getInvoicesByCategoryAndByPeriodMock =
      GetInvoicesByCategoriesAndByPeriodUseCase.create({
        billService: billServiceMock,
        receivableService: receivableServiceMock,
      });
  });

  it('should be create a instance of the GetInvoicesByCategoriesAndByPeriodUseCase class when will be use create method.', () => {
    expect(getInvoicesByCategoryAndByPeriodMock).toBeInstanceOf(
      GetInvoicesByCategoriesAndByPeriodUseCase,
    );
  });

  it('should filter by category and returns total amount of category invoice durant the informaded period with type BILLS', async () => {
    billServiceMock.handleQueryBillsByFilters.mockResolvedValue(
      billInvoiceMock,
    );

    billServiceMock.totalAmountBills.mockReturnValue(7375.82);

    const result = await getInvoicesByCategoryAndByPeriodMock.execute({
      userId: userIdMock,
      period: {
        initialDate: new Date('2025-07-01').getTime(),
        finalDate: new Date('2025-07-31').getTime(),
      },
      type: CategoryType.BILLS,
    });

    expect(billServiceMock.handleQueryBillsByFilters).toHaveBeenCalled();
    expect(
      receivableServiceMock.handleQueryReceivablesByFilters,
    ).not.toHaveBeenCalled();
    expect(result.data.type).toEqual(CategoryType.BILLS);
    expect(result.data.listInvoices.length).toBe(6);
    expect(result.data.totalInvoicedAmount).toBe(7375.82);
    expect(result.data.period).toBe('01/07/2025 - 31/07/2025');
  });

  it('should filter by category and returns total amount of category invoice durant the informaded period with type RECEIVABLE', async () => {
    receivableServiceMock.handleQueryReceivablesByFilters.mockResolvedValue(
      receivablesInvoiceMock,
    );

    receivableServiceMock.totalAmountReceivables.mockReturnValue(7375.82);

    const result = await getInvoicesByCategoryAndByPeriodMock.execute({
      userId: userIdMock,
      period: {
        initialDate: new Date('2025-01-01').getTime(),
        finalDate: new Date('2025-07-31').getTime(),
      },
      type: CategoryType.RECEIVABLE,
    });

    expect(billServiceMock.handleQueryBillsByFilters).not.toHaveBeenCalled();
    expect(
      receivableServiceMock.handleQueryReceivablesByFilters,
    ).toHaveBeenCalled();
    expect(result.data.period).toBe('01/01/2025 - 31/07/2025');
  });

  it('should throw an error if userId is not provided', async () => {
    const error = await getInvoicesByCategoryAndByPeriodMock
      .execute({
        userId: '',
        period: {
          initialDate: new Date('2025-07-01').getTime(),
          finalDate: new Date('2025-07-31').getTime(),
        },
        type: CategoryType.BILLS,
      })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_CREDENTIALS,
      statusCode: 401,
    });

    expect(billServiceMock.handleQueryBillsByFilters).not.toHaveBeenCalled();
    expect(
      receivableServiceMock.handleQueryReceivablesByFilters,
    ).not.toHaveBeenCalled();
  });

  it('should throw an error if the initialDate or finalDate are invalid (NaN)', async () => {
    const error = await getInvoicesByCategoryAndByPeriodMock
      .execute({
        userId: userIdMock,
        period: {
          initialDate: NaN,
          finalDate: new Date('2025-07-31').getTime(),
        },
        type: CategoryType.BILLS,
      })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_PERIOD,
      statusCode: 400,
    });

    expect(billServiceMock.handleQueryBillsByFilters).not.toHaveBeenCalled();
    expect(
      receivableServiceMock.handleQueryReceivablesByFilters,
    ).not.toHaveBeenCalled();
  });

  it('should throw an error if the initialDate is greater than finalDate', async () => {
    const error = await getInvoicesByCategoryAndByPeriodMock
      .execute({
        userId: userIdMock,
        period: {
          initialDate: new Date('2025-07-01').getTime(),
          finalDate: new Date('2025-03-31').getTime(),
        },
        type: CategoryType.BILLS,
      })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_PERIOD,
      statusCode: 400,
    });

    expect(billServiceMock.handleQueryBillsByFilters).not.toHaveBeenCalled();
    expect(
      receivableServiceMock.handleQueryReceivablesByFilters,
    ).not.toHaveBeenCalled();
  });

  it('should throw an error if the type is invalid', async () => {
    const error = await getInvoicesByCategoryAndByPeriodMock
      .execute({
        userId: userIdMock,
        period: {
          initialDate: new Date('2025-07-01').getTime(),
          finalDate: new Date('2025-07-31').getTime(),
        },
        type: '' as any,
      })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.CATEGORY_NOT_EXIST,
      statusCode: 400,
    });

    expect(billServiceMock.handleQueryBillsByFilters).not.toHaveBeenCalled();
    expect(
      receivableServiceMock.handleQueryReceivablesByFilters,
    ).not.toHaveBeenCalled();
  });
});
