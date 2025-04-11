import { Months } from '@/domain/dtos/months.dto';

export type CashFlowDTO = {
  year: number;
  month: (typeof Months)[keyof typeof Months];
  generalIncomes: number;
  paidIncomes: number;
  generalExpenses: number;
  paidExpenses: number;
  generalProfit: number;
  paidProfit: number;
};

export type GetConsolidatedCashFlowByYearInputDTO = {
  year: number;
  userId: string;
};
