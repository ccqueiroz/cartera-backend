import { GetReceivablesUseCase } from './get-receivables.usecase';
import { SortOrder } from '@/domain/dtos/listParamsDto.dto';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ApiError } from '@/helpers/errors';
import { ReceivableServiceGateway } from '@/domain/Receivable/gateway/receivable.service.gateway';
import { CategoryDescriptionEnum } from '@/domain/Category/enums/category-description.enum';
import { CategoryGroupEnum } from '@/domain/Category/enums/category-group.enum';
import { PaymentStatusDescriptionEnum } from '@/domain/Payment_Status/enum/payment-status-description.enum';
import { PaymentMethodDescriptionEnum } from '@/domain/Payment_Method/enums/payment-method-description.enum';

let receivableServiceMock: jest.Mocked<ReceivableServiceGateway>;

const userIdMock = '1234567d';

const receivablesItemsMocks = [
  {
    personUserId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef4',
    userId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
    descriptionReceivable: 'Test Receivable 1',
    fixedReceivable: true,
    receivableDate: new Date().getTime(),
    receivalDate: null,
    receival: false,
    icon: null,
    amount: 100,
    categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
    categoryDescription: 'Comissões e Bonificações',
    categoryDescriptionEnum: CategoryDescriptionEnum.REIMBURSEMENTS,
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
    receivableDate: new Date().getTime(),
    receivalDate: new Date().getTime(),
    receival: true,
    icon: null,
    amount: 200,
    categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
    categoryDescription: 'Aluguéis e Rendimentos de Ativos',
    categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
    categoryGroup: CategoryGroupEnum.REVENUES,
    paymentMethodDescription: 'Pix',
    paymmentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
    paymentStatus: PaymentStatusDescriptionEnum.PAID,
    createdAt: new Date().getTime(),
    updatedAt: null,
  },
];

describe('GetReceivablesUseCase', () => {
  let getReceivablesUseCase: GetReceivablesUseCase;

  beforeEach(() => {
    receivableServiceMock = {
      getReceivables: jest.fn(),
    } as any;

    getReceivablesUseCase = GetReceivablesUseCase.create({
      receivableService: receivableServiceMock,
    });
  });

  it('should be create a instance of the GetReceivablesUseCase class when will be use create method.', () => {
    expect(getReceivablesUseCase).toBeInstanceOf(GetReceivablesUseCase);
  });

  it('should be call execute method and return the receivables filled list with ReceivableDTO objects type', async () => {
    receivableServiceMock.getReceivables.mockResolvedValue({
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

    expect(result.data.content.length).toEqual(2);
    expect(receivableServiceMock.getReceivables).toHaveBeenCalledWith({
      size: 10,
      page: 0,
      userId: userIdMock,
    });
  });

  it('should be call execute method with all PaginationParams attributes valid', async () => {
    receivableServiceMock.getReceivables.mockResolvedValue({
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

    expect(receivableServiceMock.getReceivables).toHaveBeenCalledWith({
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

    expect(receivableServiceMock.getReceivables).toHaveBeenCalledWith({
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
    receivableServiceMock.getReceivables.mockResolvedValue({
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
      sort: { category: CategoryDescriptionEnum.RENT_INCOME },
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

    expect(receivableServiceMock.getReceivables).toHaveBeenCalledWith({
      ...params,
      userId: userIdMock,
    });
  });

  it('should be call execute method and return the receivables empty list', async () => {
    receivableServiceMock.getReceivables.mockResolvedValue({
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
    expect(receivableServiceMock.getReceivables).toHaveBeenCalledWith({
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

    expect(receivableServiceMock.getReceivables).not.toHaveBeenCalled();
  });
});
