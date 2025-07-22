import { BillDTO } from '@/domain/Bill/dtos/bill.dto';
import { ReceivableDTO } from '@/domain/Receivable/dtos/receivable.dto';
import { SortByStatusInputDTO } from '../dtos/sort-by-status-input.dto';

export type ListToIncludeSortItems<T extends BillDTO | ReceivableDTO> = Array<
  (item: T) => boolean
>;

export interface ApplySortStatusGateway {
  execute<T extends BillDTO | ReceivableDTO>({
    listToIncludeSortItems,
    sortByStatus,
    invoiceType,
  }: {
    listToIncludeSortItems: ListToIncludeSortItems<T>;
    sortByStatus: SortByStatusInputDTO;
    invoiceType: 'bill' | 'receivable';
  }): void;
}
