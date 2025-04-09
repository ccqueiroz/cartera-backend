import { BillDTO } from '@/domain/Bill/dtos/bill.dto';
import { CashFlowDTO } from '../dtos/cash-flow.dto';
import { ReceivableDTO } from '@/domain/Receivable/dtos/receivable.dto';

export type CashFlowEntitieProps = CashFlowDTO & {
  listExpenses: Array<BillDTO>;
  listIncomes: Array<ReceivableDTO>;
};

export class CashFlowEntitie {
  private constructor(private props: CashFlowEntitieProps) {
    this.setExpenses(this.props.listExpenses);
    this.setIncomes(this.props.listIncomes);
  }

  public static create({
    year,
    month,
    listExpenses,
    listIncomes,
  }: Omit<CashFlowEntitieProps, 'profit' | 'expenses' | 'incomes'>) {
    return new CashFlowEntitie({
      year,
      month,
      listExpenses,
      listIncomes,
      expenses: 0,
      incomes: 0,
      profit: 0,
    });
  }

  private setExpenses(listExpenses: Array<BillDTO>) {
    let total = 0;

    listExpenses.forEach((i) => {
      total += i.amount;
    });

    this.props.expenses = total;
  }

  private setIncomes(listIncomes: Array<ReceivableDTO>) {
    let total = 0;

    listIncomes.forEach((i) => {
      total += i.amount;
    });

    this.props.incomes = total;
  }

  public get year() {
    return this.props.year;
  }

  public get month() {
    return this.props.month;
  }

  public get incomes() {
    return this.props.incomes;
  }

  public get expenses() {
    return this.props.expenses;
  }

  public get profit() {
    return this.incomes - this.expenses;
  }
}
