import { SearchByDate } from '@/domain/dtos/listParamsDto.dto';

export type ReceivableSearchByDateDTO =
  | { receivableDate: SearchByDate; receivalDate?: never }
  | { receivalDate: SearchByDate; receivableDate?: never }
  | { receivableDate?: undefined; receivalDate?: undefined };

export type BillSearchByDateDTO =
  | { billDate: SearchByDate; payDate?: never }
  | { payDate: SearchByDate; billDate?: never }
  | { billDate?: undefined; payDate?: undefined };
