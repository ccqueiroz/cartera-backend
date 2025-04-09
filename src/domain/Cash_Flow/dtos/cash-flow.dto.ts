import { Months } from '@/domain/dtos/months.dto';

export type CashFlowDTO = {
  year: number;
  month: (typeof Months)[keyof typeof Months];
  incomes: number;
  expenses: number;
  profit: number;
};
