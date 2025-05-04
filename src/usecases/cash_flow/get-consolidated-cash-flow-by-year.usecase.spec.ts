import { GetConsolidatedCashFlowByYearUseCase } from './get-consolidated-cash-flow-by-year.usecase';
import { Months } from '@/domain/dtos/months.dto';
import { ApiError } from '@/helpers/errors';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { BillServiceGateway } from '@/domain/Bill/gateway/bill.service.gateway';
import { ReceivableServiceGateway } from '@/domain/Receivable/gateway/receivable.service.gateway';

let billServiceMock: jest.Mocked<BillServiceGateway>;
let receivableServiceMock: jest.Mocked<ReceivableServiceGateway>;
let getConsolidatedCashFlow: GetConsolidatedCashFlowByYearUseCase;

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
    paymentStatusId: 'd5a2f9c1-3e6a-41b9-9e6d-5c8eaf39b1b2',
    paymentStatusDescription: 'Pago',
    categoryId: 'efc9c97d-70b8-49ce-8674-9b0cedf2c3f0',
    categoryDescription: 'Educação e Leitura',
    paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
    paymentMethodDescription: 'Pix',
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
    paymentStatusId: 'd5a2f9c1-3e6a-41b9-9e6d-5c8eaf39b1b2',
    paymentStatusDescription: 'Pago',
    categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
    categoryDescription: 'Supermercado',
    paymentMethodId: 'g12c3e1b2-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
    paymentMethodDescription: 'Pix',
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
    paymentStatusId: 'd5a2f9c1-3e6a-41b9-9e6d-5c8eaf39b1b2',
    paymentStatusDescription: 'Pago',
    categoryId: 'deb29e2b-edb0-441e-be56-78d7e10f2e12',
    categoryDescription: 'Moradia e Manutenção Residencial',
    paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
    paymentMethodDescription: 'Pix',
    isPaymentCardBill: false,
    isShoppingListBill: false,
    createdAt: new Date().getTime(),
    updatedAt: null,
  },
];

const receivablesItemsMocks = [
  {
    id: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0',
    categoryId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef1',
    paymentMethodId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef2',
    paymentStatusId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef3',
    personUserId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef4',
    userId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
    descriptionReceivable: 'Test Receivable 1',
    fixedReceivable: true,
    receivableDate: new Date('02-09-2025').getTime(),
    icon: null,
    amount: 100,
    categoryDescription: 'Test Category 1',
    paymentMethodDescription: 'Test Payment Method 1',
    paymentStatusDescription: 'Paid',
    createdAt: new Date().getTime(),
    receivalDate: null,
    receival: false,
    updatedAt: null,
  },
  {
    id: 'b2c3d4e5-f6a1-8901-2345-67890abcde12',
    categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
    paymentMethodId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef2',
    paymentStatusId: 'b2c3d4e5-f6a1-8901-2345-67890abcde15',
    personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
    userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
    descriptionReceivable: 'Test Receivable 2',
    fixedReceivable: false,
    receivableDate: new Date('04-09-2025').getTime(),
    icon: null,
    amount: 200,
    categoryDescription: 'Test Category 2',
    paymentMethodDescription: 'Test Payment Method 1',
    paymentStatusDescription: 'Pending',
    createdAt: new Date().getTime(),
    receivalDate: new Date('05-09-2025').getTime(),
    receival: true,
    updatedAt: null,
  },
  {
    id: 'c3d4e5f6-a1b2-9012-3456-7890abcdef23',
    categoryId: 'c3d4e5f6-a1b2-9012-3456-7890abcdef24',
    paymentMethodId: 'c3d4e5f6-a1b2-9012-3456-7890abcdef25',
    paymentStatusId: 'c3d4e5f6-a1b2-9012-3456-7890abcdef26',
    personUserId: 'c3d4e5f6-a1b2-9012-3456-7890abcdef27',
    userId: 'c3d4e5f6-a1b2-9012-3456-7890abcdef28',
    descriptionReceivable: 'Test Receivable 3',
    fixedReceivable: true,
    receivableDate: new Date('03-09-2025').getTime(),
    icon: null,
    amount: 300,
    categoryDescription: 'Test Category 3',
    paymentMethodDescription: 'Test Payment Method 3',
    paymentStatusDescription: 'Overdue',
    createdAt: new Date().getTime(),
    receivalDate: null,
    receival: false,
    updatedAt: null,
  },
];

const userIdMock = '1234567d';

describe('GET CONSOLIDATED CASH FLOW', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    billServiceMock = {
      getBills: jest.fn(),
    } as any;

    receivableServiceMock = {
      getReceivables: jest.fn(),
    } as any;

    getConsolidatedCashFlow = GetConsolidatedCashFlowByYearUseCase.create({
      billService: billServiceMock,
      receivableService: receivableServiceMock,
    });
  });

  it('should be create a instance of the GetConsolidatedCashFlowByYearUseCase class when will be use create method.', () => {
    expect(getConsolidatedCashFlow).toBeInstanceOf(
      GetConsolidatedCashFlowByYearUseCase,
    );
  });

  it('should receive a year and must should receive a year and must return a cash flow list with all months containing the informations about its respective months cash flow return a cash flow list with all months and this cash flow informations of months', async () => {
    receivableServiceMock.getReceivables.mockResolvedValue({
      content: receivablesItemsMocks,
      totalElements: 3,
      totalPages: 1,
      page: 0,
      size: 9999,
      ordering: null,
    });

    billServiceMock.getBills.mockResolvedValue({
      content: billsItemsMock,
      totalElements: 3,
      totalPages: 1,
      page: 0,
      size: 9999,
      ordering: null,
    });

    const result = await getConsolidatedCashFlow.execute({
      year: 2025,
      userId: userIdMock,
    });

    expect(Array.isArray(result.data)).toBeTruthy();
    expect(result.data.length).toBe(12);
    expect(Object.keys(result.data[0])).toEqual([
      'year',
      'month',
      'generalIncomes',
      'paidIncomes',
      'generalExpenses',
      'paidExpenses',
      'generalProfit',
      'paidProfit',
    ]);
    expect(result.data[0].generalIncomes).toBe(0);
    expect(result.data[0].paidIncomes).toBe(0);
    expect(result.data[0].generalExpenses).toBe(0);
    expect(result.data[0].paidExpenses).toBe(0);
    expect(result.data[0].generalProfit).toBe(0);
    expect(result.data[0].paidProfit).toBe(0);
    expect(result.data[0].month).toBe(Months.JAN);

    expect(result.data[2].generalIncomes).toBe(300);
    expect(result.data[2].paidIncomes).toBe(0);
    expect(result.data[2].generalExpenses).toBe(0);
    expect(result.data[2].paidExpenses).toBe(148);
    expect(result.data[2].generalProfit).toBe(300);
    expect(result.data[2].paidProfit).toBe(-148);

    expect(result.data[3].month).toBe(Months.ABR);
    expect(result.data[3].generalIncomes).toBe(200);
    expect(result.data[3].paidIncomes).toBe(0);
    expect(result.data[3].generalExpenses).toBe(9409.56);
    expect(result.data[3].paidExpenses).toBe(0);
    expect(result.data[3].generalProfit).toBe(-9209.56);
    expect(result.data[3].paidProfit).toBe(0);
    expect(result.data[3].month).toBe(Months.ABR);
  });

  it('should throw an error if userId is not provided', async () => {
    const error = await getConsolidatedCashFlow
      .execute({
        year: 2025,
        userId: undefined as any,
      })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_CREDENTIALS,
      statusCode: 401,
    });

    expect(billServiceMock.getBills).not.toHaveBeenCalled();
    expect(receivableServiceMock.getReceivables).not.toHaveBeenCalled();
  });

  it('should throw an error if the year is invalid (NaN)', async () => {
    const error = await getConsolidatedCashFlow
      .execute({
        year: NaN,
        userId: userIdMock,
      })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_PERIOD,
      statusCode: 400,
    });

    expect(billServiceMock.getBills).not.toHaveBeenCalled();
    expect(receivableServiceMock.getReceivables).not.toHaveBeenCalled();
  });

  it('should throw an internal error if any gateway call fails', async () => {
    receivableServiceMock.getReceivables.mockRejectedValueOnce(
      new Error('Unexpected error'),
    );

    billServiceMock.getBills.mockResolvedValue({
      content: billsItemsMock,
      totalElements: 3,
      totalPages: 1,
      page: 0,
      size: 9999,
      ordering: null,
    });

    const error = await getConsolidatedCashFlow
      .execute({
        year: 2025,
        userId: userIdMock,
      })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      statusCode: 500,
    });

    expect(billServiceMock.getBills).toHaveBeenCalledTimes(1);
    expect(receivableServiceMock.getReceivables).toHaveBeenCalledTimes(1);
  });
});
