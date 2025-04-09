import { CashFlowEntitie } from './cash-flow.entitie';
import { BillDTO } from '@/domain/Bill/dtos/bill.dto';
import { Months } from '@/domain/dtos/months.dto';
import { ReceivableDTO } from '@/domain/Receivable/dtos/receivable.dto';

describe('Cash Flow Entitie', () => {
  const createMockBill = (amount: number): BillDTO => ({
    personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
    userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
    descriptionBill: 'Faculdade',
    fixedBill: false,
    billDate: new Date().getTime(),
    payDate: new Date().getTime(),
    payOut: true,
    icon: null,
    amount,
    paymentStatusId: 'd5a2f9c1-3e6a-41b9-9e6d-5c8eaf39b1b2',
    paymentStatusDescription: 'Pago',
    categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
    categoryDescription: 'Educação',
    paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
    paymentMethodDescription: 'Pix',
    isPaymentCardBill: false,
    isShoppingListBill: false,
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime(),
  });

  const createMockReceivable = (amount: number): ReceivableDTO => ({
    id: 'e76176ad-c2d8-4526-95cb-1434d5149dd4',
    personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
    userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
    descriptionReceivable: 'Salário',
    fixedReceivable: true,
    receivableDate: new Date().getTime(),
    icon: null,
    amount,
    paymentStatusId: 'd5a2f9c1-3e6a-41b9-9e6d-5c8eaf39b1b2',
    paymentStatusDescription: 'Pago',
    categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
    categoryDescription: 'Salário/Pró-labore',
    paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
    paymentMethodDescription: 'Depósito',
    receivalDate: null,
    receival: false,
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime(),
  });

  it('should create an instance and calculate expenses, incomes, and profit correctly', () => {
    const bills: BillDTO[] = [createMockBill(100), createMockBill(200)];
    const receivables: ReceivableDTO[] = [
      createMockReceivable(800),
      createMockReceivable(100),
    ];

    const cashFlow = CashFlowEntitie.create({
      year: 2025,
      month: Months.ABR,
      listExpenses: bills,
      listIncomes: receivables,
    });

    expect(cashFlow.year).toBe(2025);
    expect(cashFlow.month).toBe(Months.ABR);
    expect(cashFlow.expenses).toBe(300);
    expect(cashFlow.incomes).toBe(900);
    expect(cashFlow.profit).toBe(600);
  });

  it('should return zero for expenses, incomes, and profit when lists are empty', () => {
    const cashFlow = CashFlowEntitie.create({
      year: 2025,
      month: Months.ABR,
      listExpenses: [],
      listIncomes: [],
    });

    expect(cashFlow.expenses).toBe(0);
    expect(cashFlow.incomes).toBe(0);
    expect(cashFlow.profit).toBe(0);
  });

  it('should handle negative values correctly', () => {
    const bills: BillDTO[] = [createMockBill(-50), createMockBill(100)];
    const receivables: ReceivableDTO[] = [createMockReceivable(300)];

    const cashFlow = CashFlowEntitie.create({
      year: 2025,
      month: Months.ABR,
      listExpenses: bills,
      listIncomes: receivables,
    });

    expect(cashFlow.expenses).toBe(50);
    expect(cashFlow.incomes).toBe(300);
    expect(cashFlow.profit).toBe(250);
  });

  it('should support decimal values accurately', () => {
    const bills: BillDTO[] = [createMockBill(99.99), createMockBill(0.01)];
    const receivables: ReceivableDTO[] = [createMockReceivable(150.5)];

    const cashFlow = CashFlowEntitie.create({
      year: 2025,
      month: Months.ABR,
      listExpenses: bills,
      listIncomes: receivables,
    });

    expect(cashFlow.expenses).toBeCloseTo(100.0);
    expect(cashFlow.incomes).toBeCloseTo(150.5);
    expect(cashFlow.profit).toBeCloseTo(50.5);
  });

  it('should support negative value to profit', () => {
    const bills: BillDTO[] = [createMockBill(199.99), createMockBill(0.01)];
    const receivables: ReceivableDTO[] = [createMockReceivable(150.5)];

    const cashFlow = CashFlowEntitie.create({
      year: 2025,
      month: Months.ABR,
      listExpenses: bills,
      listIncomes: receivables,
    });

    expect(cashFlow.expenses).toBeCloseTo(200.0);
    expect(cashFlow.incomes).toBeCloseTo(150.5);
    expect(cashFlow.profit).toBeCloseTo(-49.5);
  });
});
