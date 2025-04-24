import { SortOrder } from '@/domain/dtos/listParamsDto.dto';

export type GetReceivablesInputRouteDTO = {
  userId: string;
  page: number;
  size: number;
  fixedReceivable?: boolean;
  receival?: boolean;
  amount?: number;
  sort?: string;
  sort_value?: string;
  search_by_date?: string;
  search_by_date_value?: string;
  ordering?: string;
  direction_order?: SortOrder;
};
