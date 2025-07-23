import { BillDTO } from '@/domain/Bill/dtos/bill.dto';
import { ApplySortStatusHelper } from './apply-sort-status.helpers';
import { CategoryDescriptionEnum } from '@/domain/Category/enums/category-description.enum';
import { CategoryGroupEnum } from '@/domain/Category/enums/category-group.enum';
import { PaymentMethodDescriptionEnum } from '@/domain/Payment_Method/enums/payment-method-description.enum';
import { PaymentStatusDescriptionEnum } from '@/domain/Payment_Status/enum/payment-status-description.enum';

describe('ApplySortStatusHelper', () => {
  let helper: ApplySortStatusHelper;

  beforeEach(() => {
    helper = new ApplySortStatusHelper();
  });

  it('should NOT add any filter if sortByStatus key is invalid (no matching key)', () => {
    const list: Array<(item: BillDTO) => boolean> = [];
    helper.execute({
      listToIncludeSortItems: list,
      sortByStatus: {} as any,
      invoiceType: 'bill',
    });
    expect(list.length).toBe(0);
  });

  it('should add filter for categoryDescriptionEnum and filter correctly', () => {
    const list: Array<(item: BillDTO) => boolean> = [];

    helper.execute({
      listToIncludeSortItems: list,
      sortByStatus: { category: CategoryDescriptionEnum.COLLEGE_TUITION },
      invoiceType: 'bill',
    });

    expect(list.length).toBe(1);

    const matching: BillDTO = {
      id: '24177d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Mensalidade Faculdade',
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescriptionEnum: CategoryDescriptionEnum.COLLEGE_TUITION,
      categoryGroup: CategoryGroupEnum.EDUCATION_AND_STUDIES,
      fixedBill: false,
      billDate: Date.now(),
      payDate: Date.now(),
      payOut: true,
      icon: null,
      amount: 8209.56,
      categoryDescription: 'Educação',
      paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      isPaymentCardBill: false,
      isShoppingListBill: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const notMatching = {
      ...matching,
      categoryDescriptionEnum: CategoryDescriptionEnum.BUS,
    };

    expect(list[0](matching)).toBe(true);
    expect(list[0](notMatching)).toBe(false);

    expect(list[0]({} as BillDTO)).toBe(false);
  });

  it('should add filter for categoryGroup and filter correctly', () => {
    const list: Array<(item: BillDTO) => boolean> = [];

    helper.execute({
      listToIncludeSortItems: list,
      sortByStatus: { categoryGroup: CategoryGroupEnum.EDUCATION_AND_STUDIES },
      invoiceType: 'bill',
    });
    expect(list.length).toBe(1);

    const matching: BillDTO = {
      id: '24177d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Mensalidade Faculdade',
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Educação',
      categoryDescriptionEnum: CategoryDescriptionEnum.COLLEGE_TUITION,
      categoryGroup: CategoryGroupEnum.EDUCATION_AND_STUDIES,
      fixedBill: false,
      billDate: Date.now(),
      payDate: null,
      payOut: true,
      icon: null,
      amount: 100,
      paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      isPaymentCardBill: false,
      isShoppingListBill: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const notMatching = { ...matching, categoryGroup: CategoryGroupEnum.CARE };

    expect(list[0](matching)).toBe(true);
    expect(list[0](notMatching)).toBe(false);
    expect(list[0]({} as BillDTO)).toBe(false);
  });

  it('should add filter for paymentMethodDescriptionEnum and filter correctly', () => {
    const list: Array<(item: BillDTO) => boolean> = [];

    helper.execute({
      listToIncludeSortItems: list,
      sortByStatus: { paymentMethod: PaymentMethodDescriptionEnum.PIX },
      invoiceType: 'bill',
    });
    expect(list.length).toBe(1);

    const matching: BillDTO = {
      id: '24177d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Mensalidade Faculdade',
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Educação',
      categoryDescriptionEnum: CategoryDescriptionEnum.COLLEGE_TUITION,
      categoryGroup: CategoryGroupEnum.EDUCATION_AND_STUDIES,
      fixedBill: false,
      billDate: Date.now(),
      payDate: null,
      payOut: true,
      icon: null,
      amount: 100,
      paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      isPaymentCardBill: false,
      isShoppingListBill: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const notMatching = {
      ...matching,
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.BANK_DEPOSIT,
    };

    expect(list[0](matching)).toBe(true);
    expect(list[0](notMatching)).toBe(false);
    expect(list[0]({} as BillDTO)).toBe(false);
  });

  it('should add filter for paymentStatus and filter based on definePaymentStatus result', () => {
    const list: Array<(item: BillDTO) => boolean> = [];

    helper.execute({
      listToIncludeSortItems: list,
      sortByStatus: { paymentStatus: PaymentStatusDescriptionEnum.PAID },
      invoiceType: 'bill',
    });

    expect(list.length).toBe(1);

    const matching: BillDTO = {
      id: '24177d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Mensalidade Faculdade',
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Educação',
      categoryDescriptionEnum: CategoryDescriptionEnum.COLLEGE_TUITION,
      categoryGroup: CategoryGroupEnum.EDUCATION_AND_STUDIES,
      fixedBill: false,
      billDate: Date.now(),
      payDate: null,
      payOut: true,
      icon: null,
      amount: 100,
      paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      isPaymentCardBill: false,
      isShoppingListBill: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const notMatching: BillDTO = {
      ...matching,
      payOut: false,
    };

    expect(list[0](matching)).toBe(true);
    expect(list[0](notMatching)).toBe(false);
  });

  it('should return false if definePaymentStatus returns null for paymentStatus filter', () => {
    const list: Array<(item: BillDTO) => boolean> = [];

    helper.execute({
      listToIncludeSortItems: list,
      sortByStatus: { paymentStatus: PaymentStatusDescriptionEnum.PAID },
      invoiceType: 'bill',
    });

    expect(list.length).toBe(1);

    const item: BillDTO = {
      id: '24177d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Mensalidade Faculdade',
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Educação',
      categoryDescriptionEnum: CategoryDescriptionEnum.COLLEGE_TUITION,
      categoryGroup: CategoryGroupEnum.EDUCATION_AND_STUDIES,
      fixedBill: false,
      billDate: null,
      payDate: null,
      payOut: false,
      icon: null,
      amount: 100,
      paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      isPaymentCardBill: false,
      isShoppingListBill: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    expect(list[0](item)).toBe(false);
  });
});
