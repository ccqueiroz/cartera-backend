import { BillGateway } from '@/domain/Bill/gateway/bill.gateway';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { ApiError } from '@/helpers/errors';
import { StatusBill } from '@/domain/Bill/dtos/bill.dto';
import { GetBillsPayableMonthUseCase } from './get-bills-payable-month';

let billGatewayMock: jest.Mocked<BillGateway>;
let getBillsPayableMonthUseCase: GetBillsPayableMonthUseCase;
const userIdMock = '1234567d';

jest.useFakeTimers().setSystemTime(new Date('2025-03-10').getTime());

const input = {
  userId: userIdMock,
  period: {
    initialDate: new Date('2025-03-01').getTime(),
    finalDate: new Date('2025-03-31').getTime(),
  },
};

const billsMock = [
  {
    id: '24177d92-1aee-4479-859b-72f01c9ade24',
    personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
    userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
    descriptionBill: 'Supermercado',
    fixedBill: false,
    billDate: new Date('03-05-2025').getTime(),
    payDate: new Date().getTime(),
    payOut: true,
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
    createdAt: new Date('03-05-2025').getTime(),
    updatedAt: null,
  },
  {
    id: '19582167-7jwr-1142-65cb-74d03d7az318',
    personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
    userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
    descriptionBill: 'Tim',
    fixedBill: true,
    billDate: new Date('03-12-2025').getTime(),
    payDate: new Date().getTime(),
    payOut: false,
    icon: null,
    amount: 60.0,
    paymentStatusId: 'b78994ce-b7cb-4eed-9bdc-b7443358300c',
    paymentStatusDescription: 'A pagar',
    categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
    categoryDescription: 'Assinatura de Internet, Telefonia e Streamings',
    paymentMethodId: '',
    paymentMethodDescription: '',
    isPaymentCardBill: false,
    isShoppingListBill: false,
    createdAt: new Date('03-12-2025').getTime(),
    updatedAt: null,
  },
  {
    id: '48273619-3gtd-7831-92ad-83b18e3bp932',
    personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
    userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
    descriptionBill: 'Luz',
    fixedBill: true,
    billDate: new Date('03-10-2025').getTime(),
    payDate: new Date().getTime(),
    payOut: false,
    icon: null,
    amount: 120.0,
    paymentStatusId: 'b78994ce-b7cb-4eed-9bdc-b7443358300c',
    paymentStatusDescription: 'A pagar',
    categoryId: '67815e45-44c3-415c-ba5f-5ab8998d7da6',
    categoryDescription: 'Serviços e Utilidades Públicas',
    paymentMethodId: '',
    paymentMethodDescription: '',
    isPaymentCardBill: false,
    isShoppingListBill: false,
    createdAt: new Date('03-10-2025').getTime(),
    updatedAt: null,
  },
  {
    id: '48273619-3gtd-7831-92ad-83b18e3bp932',
    personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
    userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
    descriptionBill: 'Água',
    fixedBill: true,
    billDate: new Date('03-26-2025').getTime(),
    payDate: new Date().getTime(),
    payOut: false,
    icon: null,
    amount: 90.0,
    paymentStatusId: 'b78994ce-b7cb-4eed-9bdc-b7443358300c',
    paymentStatusDescription: 'A pagar',
    categoryId: '67815e45-44c3-415c-ba5f-5ab8998d7da6',
    categoryDescription: 'Serviços e Utilidades Públicas',
    paymentMethodId: '',
    paymentMethodDescription: '',
    isPaymentCardBill: false,
    isShoppingListBill: false,
    createdAt: new Date('03-26-2025').getTime(),
    updatedAt: null,
  },
  {
    id: '87263410-4qws-3409-81ab-63c09b8bk215',
    personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
    userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
    descriptionBill: 'Cartão Visa',
    fixedBill: true,
    billDate: new Date('03-30-2025').getTime(),
    payDate: new Date().getTime(),
    payOut: false,
    icon: null,
    amount: 5200.0,
    paymentStatusId: 'b78994ce-b7cb-4eed-9bdc-b7443358300c',
    paymentStatusDescription: 'A pagar',
    categoryId: '67815e45-44c3-415c-ba5f-5ab8998d7da6',
    categoryDescription: 'Despesa com Cartão de Crédito',
    paymentMethodId: '',
    paymentMethodDescription: '',
    isPaymentCardBill: false,
    isShoppingListBill: false,
    createdAt: new Date('04-01-2025').getTime(),
    updatedAt: null,
  },
];

describe('Get Bills Payable Month Usecase', () => {
  beforeEach(() => {
    billGatewayMock = {
      getBills: jest.fn(),
      getBillById: jest.fn(),
      createBill: jest.fn(),
      updateBill: jest.fn(),
      deleteBill: jest.fn(),
      billsPayableMonth: jest.fn(),
    };

    getBillsPayableMonthUseCase = GetBillsPayableMonthUseCase.create({
      billGateway: billGatewayMock,
    });
  });

  it('should be create a instance of the GetBillsPayableMonthUseCase class when will be use create method.', () => {
    expect(getBillsPayableMonthUseCase).toBeInstanceOf(
      GetBillsPayableMonthUseCase,
    );
  });

  it('should return the bills with correct status', async () => {
    billGatewayMock.billsPayableMonth.mockResolvedValueOnce(billsMock);

    const result = await getBillsPayableMonthUseCase.execute(input);

    expect(result.data.length).toBe(5);
    expect(result.data[0].status).toBe(StatusBill.OVERDUE);
    expect(result.data[1].status).toBe(StatusBill.DUE_SOON);
    expect(result.data[2].status).toBe(StatusBill.DUE_DAY);
    expect(result.data[3].status).toBe(StatusBill.PENDING);
    expect(result.data[4].status).toBe(StatusBill.PENDING);

    expect(billGatewayMock.billsPayableMonth).toHaveBeenCalledWith(input);
  });

  it('should throw ApiError if userId is not provided', async () => {
    const error = await getBillsPayableMonthUseCase
      .execute({
        userId: '',
        period: input.period,
      })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe(ERROR_MESSAGES.INVALID_CREDENTIALS);
    expect(error.statusCode).toBe(401);
  });

  it('should return empty list if no bills returned from gateway', async () => {
    billGatewayMock.billsPayableMonth.mockResolvedValueOnce([]);

    const result = await getBillsPayableMonthUseCase.execute(input);

    expect(result.data).toEqual([]);
  });
});
