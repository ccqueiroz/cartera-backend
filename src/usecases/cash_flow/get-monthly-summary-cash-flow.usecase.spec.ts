import { GetMonthlySummaryCashFlowUseCase } from './get-monthly-summary-cash-flow.usecase';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { PaymentMethodDescriptionEnum } from '@/domain/Payment_Method/enums/payment-method-description.enum';
import { PaymentStatusDescriptionEnum } from '@/domain/Payment_Status/enum/payment-status-description.enum';
import { CategoryDescriptionEnum } from '@/domain/Category/enums/category-description.enum';
import { CategoryGroupEnum } from '@/domain/Category/enums/category-group.enum';

const billsItemsMock = [
  {
    id: '24177d92-1aee-4479-859b-72f01c9ade24',
    personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
    userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
    descriptionBill: 'Faculdade',
    fixedBill: false,
    billDate: new Date('04-09-2025').getTime(),
    payDate: null,
    payOut: false,
    icon: null,
    amount: 8209.56,
    categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
    categoryDescription: 'Educação',
    categoryDescriptionEnum: CategoryDescriptionEnum.COLLEGE_TUITION,
    categoryGroup: CategoryGroupEnum.EDUCATION_AND_STUDIES,
    paymentStatus: PaymentStatusDescriptionEnum.DUE_DAY,
    isPaymentCardBill: false,
    isShoppingListBill: false,
    createdAt: new Date().getTime(),
    updatedAt: null,
  },
  {
    id: '121377d92-1aee-4479-859b-72f01c9ade24',
    personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
    userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
    descriptionBill: 'Supermercado',
    fixedBill: false,
    billDate: new Date('04-01-2025').getTime(),
    payDate: null,
    payOut: false,
    icon: null,
    amount: 1200.0,
    categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
    categoryDescription: 'Supermercado',
    categoryDescriptionEnum: CategoryDescriptionEnum.SUPERMARKET,
    categoryGroup: CategoryGroupEnum.SHOPPING,
    paymentStatus: PaymentStatusDescriptionEnum.DUE_DAY,
    isPaymentCardBill: false,
    isShoppingListBill: true,
    createdAt: new Date().getTime(),
    updatedAt: null,
  },
  {
    id: '8766541424-1aee-4479-859b-72f01c9ade24',
    personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
    userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
    descriptionBill: 'Energia',
    fixedBill: false,
    billDate: new Date('02-09-2025').getTime(),
    payDate: new Date('03-01-2025').getTime(),
    payOut: true,
    icon: null,
    amount: 148.0,
    categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
    categoryDescription: 'Supermercado',
    categoryDescriptionEnum: CategoryDescriptionEnum.SUPERMARKET,
    categoryGroup: CategoryGroupEnum.SHOPPING,
    paymentStatus: PaymentStatusDescriptionEnum.PAID,
    paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
    paymentMethodDescription: 'Pix',
    paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.CASH,
    isPaymentCardBill: false,
    isShoppingListBill: false,
    createdAt: new Date().getTime(),
    updatedAt: null,
  },
];

const receivablesItemsMocks = [
  {
    id: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0',
    personUserId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef4',
    userId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
    descriptionReceivable: 'Test Receivable 1',
    fixedReceivable: true,
    receivableDate: new Date('02-09-2025').getTime(),
    receivalDate: null,
    receival: false,
    icon: null,
    amount: 100,
    categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
    categoryDescription: 'Salário/Pró-labore',
    categoryDescriptionEnum: CategoryDescriptionEnum.SALARY,
    categoryGroup: CategoryGroupEnum.REVENUES,
    paymentStatus: PaymentStatusDescriptionEnum.DUE_DAY,
    createdAt: new Date().getTime(),
    updatedAt: null,
  },
  {
    id: 'b2c3d4e5-f6a1-8901-2345-67890abcde12',
    personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
    userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
    descriptionReceivable: 'Test Receivable 2',
    fixedReceivable: false,
    receivableDate: new Date('04-09-2025').getTime(),
    icon: null,
    amount: 200,
    receival: true,
    receivalDate: new Date('05-09-2025').getTime(),
    categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
    categoryDescription: 'Supermercado',
    categoryDescriptionEnum: CategoryDescriptionEnum.SUPERMARKET,
    categoryGroup: CategoryGroupEnum.SHOPPING,
    paymentStatus: PaymentStatusDescriptionEnum.PAID,
    paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
    paymentMethodDescription: 'Pix',
    paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.CASH,
    createdAt: new Date().getTime(),
    updatedAt: null,
  },
  {
    id: 'c3d4e5f6-a1b2-9012-3456-7890abcdef23',
    userId: 'c3d4e5f6-a1b2-9012-3456-7890abcdef28',
    personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
    descriptionReceivable: 'Test Receivable 3',
    fixedReceivable: true,
    receivableDate: new Date('03-09-2025').getTime(),
    icon: null,
    amount: 300,
    receivalDate: null,
    receival: false,
    categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
    categoryDescription: 'Salário/Pró-labore',
    categoryDescriptionEnum: CategoryDescriptionEnum.SALARY,
    categoryGroup: CategoryGroupEnum.REVENUES,
    paymentStatus: PaymentStatusDescriptionEnum.DUE_DAY,
    createdAt: new Date().getTime(),
    updatedAt: null,
  },
];

const userIdMock = '1234567d';

const mockBillService = {
  handleQueryBillsByFilters: jest.fn(),
};
const mockReceivableService = {
  handleQueryReceivablesByFilters: jest.fn(),
};

describe('GetMonthlySummaryCashFlowUseCase', () => {
  let usecase: GetMonthlySummaryCashFlowUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = GetMonthlySummaryCashFlowUseCase.create({
      billService: mockBillService as any,
      receivableService: mockReceivableService as any,
    });
  });

  it('should return the correct monthly summary (happy path)', async () => {
    mockBillService.handleQueryBillsByFilters.mockResolvedValueOnce({
      content: billsItemsMock,
    });
    mockReceivableService.handleQueryReceivablesByFilters.mockResolvedValueOnce(
      {
        content: receivablesItemsMocks,
      },
    );

    const result = await usecase.execute({
      month: 3,
      year: 2025,
      userId: userIdMock,
      paid: true,
    });

    expect(result).toEqual({
      data: {
        fixedExpenses: 0,
        variableExpenses: billsItemsMock.reduce(
          (acc, cur) => acc + cur.amount,
          0,
        ),
        fixedIncome: receivablesItemsMocks
          .filter((r) => r.fixedReceivable)
          .reduce((acc, cur) => acc + cur.amount, 0),
        variableRevenue: receivablesItemsMocks
          .filter((r) => !r.fixedReceivable)
          .reduce((acc, cur) => acc + cur.amount, 0),
      },
    });
  });

  it('should throw INVALID_CREDENTIALS if userId is missing', async () => {
    await expect(
      usecase.execute({
        month: 3,
        year: 2025,
        userId: '' as any,
      }),
    ).rejects.toEqual(new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401));
  });

  it('should throw INVALID_PERIOD if month or year are invalid', async () => {
    await expect(
      usecase.execute({
        month: NaN as any,
        year: 2025,
        userId: userIdMock,
      }),
    ).rejects.toEqual(new ApiError(ERROR_MESSAGES.INVALID_PERIOD, 400));

    await expect(
      usecase.execute({
        month: 3,
        year: NaN as any,
        userId: userIdMock,
      }),
    ).rejects.toEqual(new ApiError(ERROR_MESSAGES.INVALID_PERIOD, 400));
  });

  it('should throw INTERNAL_SERVER_ERROR if any service rejects', async () => {
    mockBillService.handleQueryBillsByFilters.mockRejectedValueOnce(
      new Error('fail'),
    );
    mockReceivableService.handleQueryReceivablesByFilters.mockResolvedValueOnce(
      {
        content: receivablesItemsMocks,
      },
    );

    await expect(
      usecase.execute({
        month: 3,
        year: 2025,
        userId: userIdMock,
      }),
    ).rejects.toEqual(new ApiError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500));

    mockBillService.handleQueryBillsByFilters.mockResolvedValueOnce({
      content: billsItemsMock,
    });
    mockReceivableService.handleQueryReceivablesByFilters.mockRejectedValueOnce(
      new Error('fail'),
    );

    await expect(
      usecase.execute({
        month: 3,
        year: 2025,
        userId: userIdMock,
      }),
    ).rejects.toEqual(new ApiError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500));
  });

  it('should throw INTERNAL_SERVER_ERROR if calculation fails', async () => {
    mockBillService.handleQueryBillsByFilters.mockResolvedValueOnce({
      content: billsItemsMock,
    });
    mockReceivableService.handleQueryReceivablesByFilters.mockResolvedValueOnce(
      {
        content: receivablesItemsMocks,
      },
    );

    jest
      .spyOn<any, any>(usecase as any, 'getTotalAmountByFixedAndVariableItems')
      .mockImplementationOnce(() => Promise.reject(new Error('fail')))
      .mockImplementationOnce(() =>
        Promise.resolve({ fixedAmount: 0, variableAmount: 0 }),
      );

    await expect(
      usecase.execute({
        month: 3,
        year: 2025,
        userId: userIdMock,
      }),
    ).rejects.toEqual(new ApiError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500));
  });
});
