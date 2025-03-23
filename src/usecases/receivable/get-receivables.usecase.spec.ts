import { ReceivableGateway } from '@/domain/Receivable/gateway/receivable.gateway';
import { GetReceivablesUseCase } from './get-receivables.usecase';
import { SortOrder } from '@/domain/dtos/listParamsDto.dto';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ApiError } from '@/helpers/errors';

let receivableGatewayMock: jest.Mocked<ReceivableGateway>;

const userIdMock = '1234567d';

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
    receivableDate: new Date().getTime(),
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
    receivableDate: new Date().getTime(),
    icon: null,
    amount: 200,
    categoryDescription: 'Test Category 2',
    paymentMethodDescription: 'Test Payment Method 1',
    paymentStatusDescription: 'Pending',
    createdAt: new Date().getTime(),
    receivalDate: null,
    receival: false,
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
    receivableDate: new Date().getTime(),
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

describe('GetReceivablesUseCase', () => {
  let getReceivablesUseCase: GetReceivablesUseCase;

  beforeEach(() => {
    receivableGatewayMock = {
      createReceivable: jest.fn(),
      deleteReceivable: jest.fn(),
      getReceivableById: jest.fn(),
      getReceivables: jest.fn(),
      updateReceivable: jest.fn(),
    };

    getReceivablesUseCase = GetReceivablesUseCase.create({
      receivableGateway: receivableGatewayMock,
    });
  });

  it('should be create a instance of the GetReceivablesUseCase class when will be use create method.', () => {
    expect(getReceivablesUseCase).toBeInstanceOf(GetReceivablesUseCase);
  });

  it('should be call execute method and return the receivables filled list with ReceivableDTO objects type', async () => {
    receivableGatewayMock.getReceivables.mockResolvedValue({
      content: receivablesItemsMocks,
      totalElements: 3,
      totalPages: 1,
      page: 0,
      size: 10,
      ordering: null,
    });

    const result = await getReceivablesUseCase.execute({
      page: 0,
      size: 10,
      userId: userIdMock,
    });

    expect(result.data.content.length).toEqual(3);
    expect(receivableGatewayMock.getReceivables).toHaveBeenCalledWith({
      size: 10,
      page: 0,
      userId: userIdMock,
    });
  });

  it('should be call execute method with all PaginationParams attributes valid', async () => {
    receivableGatewayMock.getReceivables.mockResolvedValue({
      content: receivablesItemsMocks,
      totalElements: 3,
      totalPages: 1,
      page: 0,
      size: 10,
      ordering: { amount: SortOrder.ASC },
    });

    const initialDate = new Date().getTime();
    const finalDate = new Date().getTime();
    const exactlyDate = new Date().getTime();

    await getReceivablesUseCase.execute({
      page: 0,
      size: 10,
      ordering: { amount: SortOrder.ASC },
      searchByDate: {
        receivableDate: {
          initialDate,
          finalDate,
        },
      },
      userId: userIdMock,
    });

    expect(receivableGatewayMock.getReceivables).toHaveBeenCalledWith({
      size: 10,
      page: 0,
      ordering: { amount: SortOrder.ASC },
      searchByDate: {
        receivableDate: {
          initialDate,
          finalDate,
        },
      },
      userId: userIdMock,
    });

    await getReceivablesUseCase.execute({
      page: 0,
      size: 10,
      searchByDate: {
        receivableDate: {
          exactlyDate,
        },
      },
      userId: userIdMock,
    });

    expect(receivableGatewayMock.getReceivables).toHaveBeenCalledWith({
      size: 10,
      page: 0,
      searchByDate: {
        receivableDate: {
          exactlyDate,
        },
      },
      userId: userIdMock,
    });
  });

  it('should be call execute method with all GetReceivablesInputDTO attributes valid', async () => {
    receivableGatewayMock.getReceivables.mockResolvedValue({
      content: receivablesItemsMocks,
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
      sortByReceivables: {
        amount: 12000,
        fixedReceivable: true,
        receival: true,
      },
      searchByDate: {
        receivableDate: {
          exactlyDate,
        },
      },
    };

    await getReceivablesUseCase.execute({ ...params, userId: userIdMock });

    expect(receivableGatewayMock.getReceivables).toHaveBeenCalledWith({
      ...params,
      userId: userIdMock,
    });
  });

  it('should be call execute method and return the receivables empty list', async () => {
    receivableGatewayMock.getReceivables.mockResolvedValue({
      content: [],
      totalElements: 0,
      totalPages: 1,
      page: 0,
      size: 10,
      ordering: null,
    });

    const result = await getReceivablesUseCase.execute({
      page: 0,
      size: 10,
      userId: userIdMock,
    });

    expect(result.data.content.length).toEqual(0);
    expect(result.data.totalElements).toEqual(0);
    expect(receivableGatewayMock.getReceivables).toHaveBeenCalledWith({
      size: 10,
      page: 0,
      userId: userIdMock,
    });
  });

  it('should be throw an error if the userId does not passed', async () => {
    const error = await getReceivablesUseCase
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

    expect(receivableGatewayMock.getReceivables).not.toHaveBeenCalled();
  });
});
