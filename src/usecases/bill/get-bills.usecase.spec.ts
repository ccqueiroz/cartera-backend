import { BillGateway } from '@/domain/Bill/gateway/bill.gateway';
import { GetBillsUseCase } from './get-bills.usecase';
import { SortOrder } from '@/domain/dtos/listParamsDto.dto';
import { ApiError } from '@/helpers/errors';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';

let billGatewayMock: jest.Mocked<BillGateway>;
let getBillsUseCase: GetBillsUseCase;
const userIdMock = '1234567d';

const billsItemsMock = [
  {
    id: '24177d92-1aee-4479-859b-72f01c9ade24',
    personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
    userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
    descriptionBill: 'Faculdade',
    fixedBill: false,
    billDate: new Date().getTime(),
    payDate: new Date().getTime(),
    payOut: true,
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
    billDate: new Date().getTime(),
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
    createdAt: new Date().getTime(),
    updatedAt: null,
  },
  {
    id: '8766541424-1aee-4479-859b-72f01c9ade24',
    personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
    userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
    descriptionBill: 'Energia',
    fixedBill: false,
    billDate: new Date().getTime(),
    payDate: new Date().getTime(),
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

describe('Get Bills UseCase', () => {
  beforeEach(() => {
    billGatewayMock = {
      getBills: jest.fn(),
    } as any;

    getBillsUseCase = GetBillsUseCase.create({
      billGateway: billGatewayMock,
    });
  });

  it('should be create a instance of the GetBillsUseCase class when will be use create method.', () => {
    expect(getBillsUseCase).toBeInstanceOf(GetBillsUseCase);
  });

  it('should be call execute method and return the bills filled list with BillDTO objects type', async () => {
    billGatewayMock.getBills.mockResolvedValue({
      content: billsItemsMock,
      totalElements: 3,
      totalPages: 1,
      page: 0,
      size: 10,
      ordering: null,
    });

    const result = await getBillsUseCase.execute({
      page: 0,
      size: 10,
      userId: userIdMock,
    });

    expect(result.data.content.length).toBe(3);
    expect(billGatewayMock.getBills).toHaveBeenCalledWith({
      page: 0,
      size: 10,
      userId: userIdMock,
    });
  });

  it('should be call execute method with all PaginationParams attributes valid', async () => {
    billGatewayMock.getBills.mockResolvedValue({
      content: billsItemsMock,
      totalElements: 3,
      totalPages: 1,
      page: 0,
      size: 10,
      ordering: { amount: SortOrder.ASC },
    });

    const initialDate = new Date().getTime();
    const finalDate = new Date().getTime();
    const exactlyDate = new Date().getTime();

    await getBillsUseCase.execute({
      page: 0,
      size: 10,
      ordering: { amount: SortOrder.ASC },
      searchByDate: {
        billDate: {
          initialDate,
          finalDate,
        },
      },
      userId: userIdMock,
    });

    expect(billGatewayMock.getBills).toHaveBeenCalledWith({
      size: 10,
      page: 0,
      ordering: { amount: SortOrder.ASC },
      searchByDate: {
        billDate: {
          initialDate,
          finalDate,
        },
      },
      userId: userIdMock,
    });

    await getBillsUseCase.execute({
      page: 0,
      size: 10,
      ordering: { amount: SortOrder.ASC },
      searchByDate: {
        billDate: {
          exactlyDate,
        },
      },
      userId: userIdMock,
    });

    expect(billGatewayMock.getBills).toHaveBeenCalledWith({
      size: 10,
      page: 0,
      ordering: { amount: SortOrder.ASC },
      searchByDate: {
        billDate: {
          exactlyDate,
        },
      },
      userId: userIdMock,
    });
  });

  it('should be call execute method with all GetBillsInputDTO attributes valid', async () => {
    billGatewayMock.getBills.mockResolvedValue({
      content: billsItemsMock,
      totalElements: 3,
      totalPages: 1,
      page: 0,
      size: 10,
      ordering: { amount: SortOrder.DESC },
    });

    const exactlyDate = new Date().getTime();

    const params = {
      size: 10,
      page: 0,
      sort: { categoryId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef1' },
      ordering: { amount: SortOrder.DESC },
      sortByBills: {
        amount: 12000,
        fixedBill: true,
        payOut: true,
        isShoppingListBill: true,
        isPaymentCardBill: false,
      },
      searchByDate: {
        billDate: {
          exactlyDate,
        },
      },
    };

    const result = await getBillsUseCase.execute({
      ...params,
      userId: userIdMock,
    });

    expect(billGatewayMock.getBills).toHaveBeenCalledWith({
      ...params,
      userId: userIdMock,
    });
    expect(result.data.ordering).toEqual({ amount: SortOrder.DESC });
  });

  it('should be call execute method and return the bills empty list', async () => {
    billGatewayMock.getBills.mockResolvedValue({
      content: [],
      totalElements: 0,
      totalPages: 1,
      page: 0,
      size: 10,
      ordering: { amount: SortOrder.DESC },
    });

    const result = await getBillsUseCase.execute({
      page: 0,
      size: 10,
      ordering: { amount: SortOrder.DESC },
      userId: userIdMock,
    });

    expect(result.data.content.length).toBe(0);
    expect(result.data.totalElements).toEqual(0);
    expect(billGatewayMock.getBills).toHaveBeenCalledWith({
      page: 0,
      size: 10,
      ordering: { amount: SortOrder.DESC },
      userId: userIdMock,
    });
  });

  it('should be throw an error if the userId does not passed', async () => {
    const error = await getBillsUseCase
      .execute({
        page: 0,
        size: 10,
        userId: '',
      })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_CREDENTIALS,
      statusCode: 401,
    });

    expect(billGatewayMock.getBills).not.toHaveBeenCalled();
  });
});
