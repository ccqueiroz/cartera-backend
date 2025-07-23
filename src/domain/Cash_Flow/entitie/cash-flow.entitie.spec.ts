import { CategoryDescriptionEnum } from '@/domain/Category/enums/category-description.enum';
import { CashFlowEntitie } from './cash-flow.entitie';
import { BillDTO } from '@/domain/Bill/dtos/bill.dto';
import { PaymentStatusDescriptionEnum } from '@/domain/Payment_Status/enum/payment-status-description.enum';
import { ReceivableDTO } from '@/domain/Receivable/dtos/receivable.dto';
import { Months } from '@/domain/dtos/months.dto';
import { CategoryGroupEnum } from '@/domain/Category/enums/category-group.enum';
import { PaymentMethodDescriptionEnum } from '@/domain/Payment_Method/enums/payment-method-description.enum';

const createMockBill = (amount: number, paid = false): BillDTO => ({
  personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
  userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
  descriptionBill: 'Mock Bill',
  fixedBill: false,
  billDate: new Date().getTime(),
  payDate: new Date().getTime(),
  payOut: paid,
  icon: null,
  amount,
  categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
  categoryDescription: 'Educação',
  paymentMethodId: paid ? 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d' : undefined,
  paymentMethodDescription: paid ? 'Pix' : undefined,
  paymentMethodDescriptionEnum: paid
    ? PaymentMethodDescriptionEnum.CASH
    : undefined,
  categoryDescriptionEnum: CategoryDescriptionEnum.COLLEGE_TUITION,
  categoryGroup: CategoryGroupEnum.EDUCATION_AND_STUDIES,
  paymentStatus: paid
    ? PaymentStatusDescriptionEnum.PAID
    : PaymentStatusDescriptionEnum.DUE_DAY,
  isPaymentCardBill: false,
  isShoppingListBill: false,
  createdAt: new Date().getTime(),
  updatedAt: new Date().getTime(),
});

const createMockReceivable = (amount: number, paid = false): ReceivableDTO => ({
  id: 'receivable-id',
  personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
  userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
  descriptionReceivable: 'Mock Receivable',
  fixedReceivable: true,
  receivableDate: new Date().getTime(),
  receivalDate: new Date().getTime(),
  receival: paid,
  icon: null,
  amount,
  categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
  categoryDescription: 'Educação',
  paymentMethodId: paid ? 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d' : undefined,
  paymentMethodDescription: paid ? 'Pix' : undefined,
  paymentMethodDescriptionEnum: paid
    ? PaymentMethodDescriptionEnum.CASH
    : undefined,
  categoryDescriptionEnum: CategoryDescriptionEnum.COLLEGE_TUITION,
  categoryGroup: CategoryGroupEnum.EDUCATION_AND_STUDIES,
  paymentStatus: paid
    ? PaymentStatusDescriptionEnum.PAID
    : PaymentStatusDescriptionEnum.DUE_DAY,
  createdAt: new Date().getTime(),
  updatedAt: new Date().getTime(),
});

describe('Cash Flow Entitie', () => {
  it('should calculate expenses, incomes and profits correctly for a typical scenario', () => {
    const bills: BillDTO[] = [
      createMockBill(100, true),
      createMockBill(200, false),
      createMockBill(200, true),
    ];

    const receivables: ReceivableDTO[] = [
      createMockReceivable(800, false),
      createMockReceivable(100, false),
      createMockReceivable(100, true),
    ];
    const paidBills = bills.filter((bill) => bill.payOut);
    const receivedReceivables = receivables.filter(
      (receivable) => receivable.receival,
    );

    const cashFlow = CashFlowEntitie.create({
      year: 2025,
      month: Months.ABR,
      listGeneralExpenses: bills,
      listPaidExpenses: paidBills,
      listGeneralIncomes: receivables,
      listPaidIncomes: receivedReceivables,
    });

    expect(cashFlow.year).toBe(2025);
    expect(cashFlow.month).toBe(Months.ABR);
    expect(cashFlow.generalExpenses).toBe(500);
    expect(cashFlow.paidExpenses).toBe(300);
    expect(cashFlow.generalIncomes).toBe(1000);
    expect(cashFlow.paidIncomes).toBe(100);
    expect(cashFlow.generalProfit).toBe(500);
    expect(cashFlow.paidProfit).toBe(-200);
  });

  it('should return zero for all values when expense and income lists are empty', () => {
    const cashFlow = CashFlowEntitie.create({
      year: 2025,
      month: Months.ABR,
      listGeneralExpenses: [],
      listPaidExpenses: [],
      listGeneralIncomes: [],
      listPaidIncomes: [],
    });

    expect(cashFlow.generalExpenses).toBe(0);
    expect(cashFlow.paidExpenses).toBe(0);
    expect(cashFlow.generalIncomes).toBe(0);
    expect(cashFlow.paidIncomes).toBe(0);
    expect(cashFlow.generalProfit).toBe(0);
    expect(cashFlow.paidProfit).toBe(0);
  });

  it('should handle negative values correctly', () => {
    const bills: BillDTO[] = [
      createMockBill(-50, true),
      createMockBill(100, true),
      createMockBill(20, false),
    ];

    const receivables: ReceivableDTO[] = [
      createMockReceivable(-20, true),
      createMockReceivable(100, false),
    ];
    const paidBills = bills.filter((bill) => bill.payOut);
    const receivedReceivables = receivables.filter(
      (receivable) => receivable.receival,
    );

    const cashFlow = CashFlowEntitie.create({
      year: 2025,
      month: Months.MAI,
      listGeneralExpenses: bills,
      listPaidExpenses: paidBills,
      listGeneralIncomes: receivables,
      listPaidIncomes: receivedReceivables,
    });

    expect(cashFlow.generalExpenses).toBe(70);
    expect(cashFlow.paidExpenses).toBe(50);
    expect(cashFlow.generalIncomes).toBe(80);
    expect(cashFlow.paidIncomes).toBe(-20);
    expect(cashFlow.generalProfit).toBe(10);
    expect(cashFlow.paidProfit).toBe(-70);
  });

  it('should support decimal values accurately', () => {
    const bills: BillDTO[] = [
      createMockBill(99.99, true),
      createMockBill(0.01, false),
    ];
    const receivables: ReceivableDTO[] = [createMockReceivable(150.5, true)];
    const paidBills = bills.filter((bill) => bill.payOut);
    const receivedReceivables = receivables.filter(
      (receivable) => receivable.receival,
    );

    const cashFlow = CashFlowEntitie.create({
      year: 2025,
      month: Months.JUN,
      listGeneralExpenses: bills,
      listPaidExpenses: paidBills,
      listGeneralIncomes: receivables,
      listPaidIncomes: receivedReceivables,
    });

    expect(cashFlow.generalExpenses).toBeCloseTo(100.0);
    expect(cashFlow.paidExpenses).toBeCloseTo(99.99);
    expect(cashFlow.generalIncomes).toBeCloseTo(150.5);
    expect(cashFlow.paidIncomes).toBeCloseTo(150.5);
    expect(cashFlow.generalProfit).toBeCloseTo(50.5);
    expect(cashFlow.paidProfit).toBeCloseTo(50.51);
  });

  it('should support scenarios with negative profit', () => {
    const bills: BillDTO[] = [
      createMockBill(199.99, false),
      createMockBill(0.01, false),
    ];

    const receivables: ReceivableDTO[] = [createMockReceivable(150.5, true)];
    const paidBills = bills.filter((bill) => bill.payOut);
    const receivedReceivables = receivables.filter(
      (receivable) => receivable.receival,
    );

    const cashFlow = CashFlowEntitie.create({
      year: 2025,
      month: Months.JUL,
      listGeneralExpenses: bills,
      listPaidExpenses: paidBills,
      listGeneralIncomes: receivables,
      listPaidIncomes: receivedReceivables,
    });

    expect(cashFlow.generalExpenses).toBeCloseTo(200.0);
    expect(cashFlow.paidExpenses).toBe(0);
    expect(cashFlow.generalIncomes).toBeCloseTo(150.5);
    expect(cashFlow.paidIncomes).toBeCloseTo(150.5);
    expect(cashFlow.generalProfit).toBeCloseTo(-49.5);
    expect(cashFlow.paidProfit).toBeCloseTo(150.5);
  });

  it('should expose the correct year and month via getters', () => {
    const bills: BillDTO[] = [createMockBill(100, true)];
    const receivables: ReceivableDTO[] = [createMockReceivable(200, true)];
    const paidBills = bills.filter((bill) => bill.payOut);
    const receivedReceivables = receivables.filter(
      (receivable) => receivable.receival,
    );

    const cashFlow = CashFlowEntitie.create({
      year: 2030,
      month: Months.DEZ,
      listGeneralExpenses: bills,
      listPaidExpenses: paidBills,
      listGeneralIncomes: receivables,
      listPaidIncomes: receivedReceivables,
    });

    expect(cashFlow.year).toBe(2030);
    expect(cashFlow.month).toBe(Months.DEZ);
  });
});
