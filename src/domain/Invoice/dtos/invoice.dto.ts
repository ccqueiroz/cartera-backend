import {
  CategoryDescriptionEnumType,
  CategoryGroupEnumType,
} from '@/domain/Category/dtos/category.dto';
import { CategoryType } from '@/domain/Category/enums/category-type.enum';
import { SearchByDate } from '@/domain/dtos/listParamsDto.dto';

export type PeriodInvoicesByCategory = Required<
  Omit<SearchByDate, 'exactlyDate'>
>;

export type GetInvoicesByCategoryAndPeriodInputDTO = {
  period: PeriodInvoicesByCategory;
  userId: string;
  type: CategoryType;
  paid?: boolean;
};

export type InvoiceCategory = {
  description: string;
  descriptionEnum: CategoryDescriptionEnumType;
  group: CategoryGroupEnumType;
  type: CategoryType;
  totalAmount: number;
  percentByPeriod: number;
};

export type InvoiceByCategoryAndByPeriodOutput = {
  listInvoices: Array<InvoiceCategory>;
  period: string;
  totalInvoicedAmount: number;
  type: CategoryType;
};
