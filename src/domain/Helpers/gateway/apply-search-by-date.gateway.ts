import { BillDTO } from '@/domain/Bill/dtos/bill.dto';
import { ReceivableDTO } from '@/domain/Receivable/dtos/receivable.dto';
import {
  BillSearchByDateDTO,
  ReceivableSearchByDateDTO,
} from '../dtos/search-by-date-input.dto';

export type ListToIncludeSearchItems<T extends BillDTO | ReceivableDTO> = Array<
  (item: T) => boolean
>;

export interface ApplySearchByDateGateway {
  execute<T extends BillDTO | ReceivableDTO>({
    listToIncludeSearchItems,
    searchByDate,
  }: {
    listToIncludeSearchItems: ListToIncludeSearchItems<T>;
    searchByDate:
      | {
          typeDTO: BillSearchByDateDTO;
          invoiceType: 'bill';
        }
      | {
          typeDTO: ReceivableSearchByDateDTO;
          invoiceType: 'receivable';
        };
  }): void;
}
