import { BillDTO } from '@/domain/Bill/dtos/bill.dto';
import { CashFlowDTO } from '../dtos/cash-flow.dto';
import { ReceivableDTO } from '@/domain/Receivable/dtos/receivable.dto';

export type CashFlowEntitieProps = CashFlowDTO & {
  listGeneralExpenses: Array<BillDTO>;
  listPaidExpenses: Array<BillDTO>;
  listGeneralIncomes: Array<ReceivableDTO>;
  listPaidIncomes: Array<ReceivableDTO>;
};

export class CashFlowEntitie {
  private constructor(private props: CashFlowEntitieProps) {
    this.setExpenses(
      this.props.listGeneralExpenses,
      this.props.listPaidExpenses,
    );
    this.setIncomes(this.props.listGeneralIncomes, this.props.listPaidIncomes);
  }

  public static create({
    year,
    month,
    listGeneralExpenses,
    listPaidExpenses,
    listGeneralIncomes,
    listPaidIncomes,
  }: Omit<
    CashFlowEntitieProps,
    | 'generalProfit'
    | 'paidProfit'
    | 'generalExpenses'
    | 'paidExpenses'
    | 'generalIncomes'
    | 'paidIncomes'
  >) {
    return new CashFlowEntitie({
      year,
      month,
      listGeneralExpenses,
      listPaidExpenses,
      listGeneralIncomes,
      listPaidIncomes,
      generalExpenses: 0,
      generalIncomes: 0,
      paidExpenses: 0,
      paidIncomes: 0,
      generalProfit: 0,
      paidProfit: 0,
    });
  }

  private setExpenses(generalList: Array<BillDTO>, paidList: Array<BillDTO>) {
    this.props.generalExpenses = generalList.reduce(
      (acc, i) => acc + i.amount,
      0,
    );
    this.props.paidExpenses = paidList.reduce((acc, i) => acc + i.amount, 0);
  }

  private setIncomes(
    generalList: Array<ReceivableDTO>,
    paidList: Array<ReceivableDTO>,
  ) {
    this.props.generalIncomes = generalList.reduce(
      (acc, i) => acc + i.amount,
      0,
    );
    this.props.paidIncomes = paidList.reduce((acc, i) => acc + i.amount, 0);
  }

  public get year() {
    return this.props.year;
  }

  public get month() {
    return this.props.month;
  }

  public get generalIncomes() {
    return this.props.generalIncomes;
  }

  public get paidIncomes() {
    return this.props.paidIncomes;
  }

  public get generalExpenses() {
    return this.props.generalExpenses;
  }

  public get paidExpenses() {
    return this.props.paidExpenses;
  }

  public get generalProfit() {
    return this.generalIncomes - this.generalExpenses;
  }

  public get paidProfit() {
    return this.paidIncomes - this.paidExpenses;
  }
}
