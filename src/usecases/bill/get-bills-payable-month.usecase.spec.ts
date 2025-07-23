import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { ApiError } from '@/helpers/errors';
import { BillDTO } from '@/domain/Bill/dtos/bill.dto';
import { GetBillsPayableMonthUseCase } from './get-bills-payable-month.usecase';
import { BillServiceGateway } from '@/domain/Bill/gateway/bill.service.gateway';
import { PaymentStatusDescriptionEnum } from '@/domain/Payment_Status/enum/payment-status-description.enum';
import { CategoryDescriptionEnum } from '@/domain/Category/enums/category-description.enum';
import { CategoryGroupEnum } from '@/domain/Category/enums/category-group.enum';

let billServiceMock: jest.Mocked<BillServiceGateway>;
let getBillsPayableMonthUseCase: GetBillsPayableMonthUseCase;
const userIdMock = '1234567d';

const input = {
  userId: userIdMock,
  period: {
    initialDate: new Date('2025-03-01').getTime(),
    finalDate: new Date('2025-03-31').getTime(),
  },
  page: 0,
  size: 10,
};

const billsMock = [
  {
    id: '19582167-7jwr-1142-65cb-74d03d7az318',
    personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
    userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
    descriptionBill: 'Tim',
    fixedBill: true,
    amount: 60.0,
    billDate: new Date('03-12-2025').getTime(),
    categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
    categoryDescription: 'Assinatura de Internet, Telefonia e Streamings',
    categoryDescriptionEnum: CategoryDescriptionEnum.INTERNET_TV,
    categoryGroup: CategoryGroupEnum.HOUSING,
    paymentStatus: PaymentStatusDescriptionEnum.OVERDUE,
  },
  {
    id: '48273619-3gtd-7831-92ad-83b18e3bp932',
    personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
    userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
    descriptionBill: 'Luz',
    fixedBill: true,
    billDate: new Date('03-10-2025').getTime(),
    amount: 120.0,
    categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
    categoryDescription: 'Energia',
    categoryDescriptionEnum: CategoryDescriptionEnum.ENERGY,
    categoryGroup: CategoryGroupEnum.HOUSING,
    paymentStatus: PaymentStatusDescriptionEnum.DUE_SOON,
  },
  {
    id: '48273619-3gtd-7831-92ad-83b18e3bp932',
    personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
    userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
    descriptionBill: 'Água',
    fixedBill: true,
    billDate: new Date('03-26-2025').getTime(),
    amount: 90.0,
    categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
    categoryDescription: 'Água',
    categoryDescriptionEnum: CategoryDescriptionEnum.WATER,
    categoryGroup: CategoryGroupEnum.HOUSING,
    paymentStatus: PaymentStatusDescriptionEnum.DUE_DAY,
  },
  {
    id: '87263410-4qws-3409-81ab-63c09b8bk215',
    personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
    userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
    descriptionBill: 'Cartão Visa',
    fixedBill: true,
    billDate: new Date('03-30-2025').getTime(),
    amount: 5200.0,
    categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
    categoryDescription: 'Despesa com Cartão de Crédito',
    categoryDescriptionEnum: CategoryDescriptionEnum.CREDIT_CARD_PAYMENT,
    categoryGroup: CategoryGroupEnum.OTHERS,
    paymentStatus: PaymentStatusDescriptionEnum.TO_PAY,
  },
] as Array<BillDTO>;

describe('Get Bills Payable Month Usecase', () => {
  beforeEach(() => {
    billServiceMock = {
      getBills: jest.fn(),
      billsPayableMonth: jest.fn(),
    } as any;

    getBillsPayableMonthUseCase = GetBillsPayableMonthUseCase.create({
      billService: billServiceMock,
    });
  });

  it('should be create a instance of the GetBillsPayableMonthUseCase class when will be use create method.', () => {
    expect(getBillsPayableMonthUseCase).toBeInstanceOf(
      GetBillsPayableMonthUseCase,
    );
  });

  it('should return the bills with correct status', async () => {
    billServiceMock.billsPayableMonth.mockResolvedValueOnce({
      content: billsMock,
      page: 1,
      size: 10,
      totalElements: 4,
      totalPages: 1,
      ordering: null,
    });

    const result = await getBillsPayableMonthUseCase.execute(input);

    expect(result.data.content.length).toBe(4);
    expect(result.data.content[0].status).toBe(
      PaymentStatusDescriptionEnum.OVERDUE,
    );
    expect(result.data.content[1].status).toBe(
      PaymentStatusDescriptionEnum.DUE_SOON,
    );
    expect(result.data.content[2].status).toBe(
      PaymentStatusDescriptionEnum.DUE_DAY,
    );
    expect(result.data.content[3].status).toBe(
      PaymentStatusDescriptionEnum.TO_PAY,
    );

    expect(billServiceMock.billsPayableMonth).toHaveBeenCalledWith(input);
  });

  it('should throw ApiError if userId is not provided', async () => {
    const error = await getBillsPayableMonthUseCase
      .execute({
        userId: '',
        period: input.period,
        page: 0,
        size: 10,
      })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe(ERROR_MESSAGES.INVALID_CREDENTIALS);
    expect(error.statusCode).toBe(401);
  });

  it('should return empty list if no bills returned from gateway', async () => {
    billServiceMock.billsPayableMonth.mockResolvedValueOnce({
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      ordering: null,
    });

    const result = await getBillsPayableMonthUseCase.execute(input);

    expect(result.data).toEqual({
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      ordering: null,
    });
  });
});
