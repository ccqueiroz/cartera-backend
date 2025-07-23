import {
  BillDTO,
  GetBillsInputDTO,
  OrderByGetBillsInputDTO,
} from '@/domain/Bill/dtos/bill.dto';
import { ApplyPaginationHelper } from './apply-pagination.helpers';
import { SortOrder } from '@/domain/dtos/listParamsDto.dto';
import { PaymentStatusDescriptionEnum } from '@/domain/Payment_Status/enum/payment-status-description.enum';
import { CategoryDescriptionEnum } from '@/domain/Category/enums/category-description.enum';
import { CategoryGroupEnum } from '@/domain/Category/enums/category-group.enum';
import { PaymentMethodDescriptionEnum } from '@/domain/Payment_Method/enums/payment-method-description.enum';

let applyPaginationMock: ApplyPaginationHelper;

const responseMock: Array<BillDTO> = [
  {
    id: '24177d92-1aee-4479-859b-72f01c9ade24',
    personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
    userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
    descriptionBill: 'Mensalidade Faculdade',
    categoryDescriptionEnum: CategoryDescriptionEnum.COLLEGE_TUITION,
    categoryGroup: CategoryGroupEnum.EDUCATION_AND_STUDIES,
    fixedBill: false,
    billDate: new Date().getTime(),
    payDate: new Date().getTime(),
    payOut: true,
    icon: null,
    amount: 8209.56,
    categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
    categoryDescription: 'Educação',
    paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
    paymentMethodDescription: 'Pix',
    paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
    paymentStatus: PaymentStatusDescriptionEnum.PAID,
    isPaymentCardBill: false,
    isShoppingListBill: false,
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime(),
  },
  {
    id: '24177d92-1aee-4479-859b-72f01c9ade24',
    personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
    userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
    descriptionBill: 'Mensalidade Faculdade',
    categoryDescriptionEnum: CategoryDescriptionEnum.COLLEGE_TUITION,
    categoryGroup: CategoryGroupEnum.EDUCATION_AND_STUDIES,
    fixedBill: false,
    billDate: new Date().getTime(),
    payDate: new Date().getTime(),
    payOut: true,
    icon: null,
    amount: 1200.0,
    categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
    categoryDescription: 'Educação',
    paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
    paymentMethodDescription: 'Pix',
    paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
    paymentStatus: PaymentStatusDescriptionEnum.PAID,
    isPaymentCardBill: false,
    isShoppingListBill: false,
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime(),
  },
  {
    id: '24177d92-1aee-4479-859b-72f01c9ade24',
    personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
    userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
    descriptionBill: 'Mensalidade Faculdade',
    categoryDescriptionEnum: CategoryDescriptionEnum.COLLEGE_TUITION,
    categoryGroup: CategoryGroupEnum.EDUCATION_AND_STUDIES,
    fixedBill: false,
    billDate: new Date().getTime(),
    payDate: new Date().getTime(),
    payOut: true,
    icon: null,
    amount: 148.56,
    categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
    categoryDescription: 'Educação',
    paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
    paymentMethodDescription: 'Pix',
    paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
    paymentStatus: PaymentStatusDescriptionEnum.PAID,
    isPaymentCardBill: false,
    isShoppingListBill: false,
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime(),
  },
];

describe('Apply Pagination Helper', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    applyPaginationMock = new ApplyPaginationHelper();
  });

  it('should return the first page correctly', () => {
    const result = applyPaginationMock.execute<
      GetBillsInputDTO,
      OrderByGetBillsInputDTO,
      BillDTO
    >({ page: 0, size: 2 }, responseMock);

    expect(result.content).toEqual([responseMock[0], responseMock[1]]);
    expect(result.totalPages).toBe(2);
    expect(result.ordering).toBeNull();
    expect(result.page).toBe(0);
    expect(result.size).toBe(2);
  });

  it('should return empty content for invalid page', () => {
    const result = applyPaginationMock.execute<
      GetBillsInputDTO,
      OrderByGetBillsInputDTO,
      BillDTO
    >({ page: 3, size: 2 }, responseMock);

    expect(result.content).toEqual([]);
    expect(result.totalPages).toBe(2);
    expect(result.ordering).toBeNull();
    expect(result.page).toBe(3);
    expect(result.size).toBe(2);
  });

  it('should return the second page correctly', () => {
    const result = applyPaginationMock.execute<
      GetBillsInputDTO,
      OrderByGetBillsInputDTO,
      BillDTO
    >({ page: 1, size: 1 }, responseMock);

    expect(result.content).toEqual([responseMock[1]]);
    expect(result.content[0].id).toEqual(responseMock[1].id);
    expect(result.totalPages).toBe(3);
    expect(result.ordering).toBeNull();
    expect(result.page).toBe(1);
    expect(result.size).toBe(1);
  });

  it('should include the ordering in the return', () => {
    const result = applyPaginationMock.execute<
      GetBillsInputDTO,
      OrderByGetBillsInputDTO,
      BillDTO
    >({ page: 0, size: 10, ordering: { amount: SortOrder.ASC } }, responseMock);

    expect(result.ordering).toEqual({ amount: SortOrder.ASC });
  });

  it('should return null ordering', () => {
    const result = applyPaginationMock.execute<
      GetBillsInputDTO,
      OrderByGetBillsInputDTO,
      BillDTO
    >({ page: 0, size: 10 }, responseMock);

    expect(result.ordering).toBeNull();
  });

  it('should handle size 0', () => {
    const result = applyPaginationMock.execute<
      GetBillsInputDTO,
      OrderByGetBillsInputDTO,
      BillDTO
    >({ page: 0, size: 0 }, responseMock);

    expect(result.content.length).toEqual(0);
    expect(result.totalElements).toEqual(0);
    expect(result.totalPages).toEqual(0);
  });

  it('should return empty content for negative page', () => {
    const result = applyPaginationMock.execute<
      GetBillsInputDTO,
      OrderByGetBillsInputDTO,
      BillDTO
    >({ page: -1, size: 10 }, responseMock);

    expect(result.content.length).toEqual(0);
    expect(result.totalElements).toEqual(0);
    expect(result.totalPages).toEqual(0);
  });

  it('should ignore empty ordering', () => {
    const result = applyPaginationMock.execute<
      GetBillsInputDTO,
      OrderByGetBillsInputDTO,
      BillDTO
    >(
      {
        page: 0,
        size: 10,
        ordering: {} as OrderByGetBillsInputDTO,
      },
      responseMock,
    );

    expect(result.content.length).toEqual(3);
    expect(result.totalElements).toEqual(3);
    expect(result.ordering).toBeNull();
  });

  it('should handle page and size undefined', () => {
    const result = applyPaginationMock.execute<
      GetBillsInputDTO,
      OrderByGetBillsInputDTO,
      BillDTO
    >(
      {
        page: undefined as any,
        size: undefined as any,
        ordering: {} as OrderByGetBillsInputDTO,
      },
      responseMock,
    );

    expect(result.content.length).toEqual(0);
    expect(result.totalElements).toEqual(0);
    expect(result.totalPages).toEqual(0);
  });
});
