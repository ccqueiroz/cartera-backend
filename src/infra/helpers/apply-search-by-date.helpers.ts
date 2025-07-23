import { BillDTO } from '@/domain/Bill/dtos/bill.dto';
import { SearchByDate } from '@/domain/dtos/listParamsDto.dto';
import {
  ReceivableSearchByDateDTO,
  BillSearchByDateDTO,
} from '@/domain/Helpers/dtos/search-by-date-input.dto';
import {
  ApplySearchByDateGateway,
  ListToIncludeSearchItems,
} from '@/domain/Helpers/gateway/apply-search-by-date.gateway';
import { ReceivableDTO } from '@/domain/Receivable/dtos/receivable.dto';

export class ApplySearchByDateHelper implements ApplySearchByDateGateway {
  private defineKey(
    searchByDate: BillSearchByDateDTO | ReceivableSearchByDateDTO,
    invoiceType: 'bill' | 'receivable',
  ) {
    let key:
      | keyof ReceivableSearchByDateDTO
      | keyof BillSearchByDateDTO
      | undefined;
    if (invoiceType === 'bill') {
      const billSearch = searchByDate as BillSearchByDateDTO;
      key = (
        billSearch.billDate
          ? 'billDate'
          : billSearch.payDate
          ? 'payDate'
          : undefined
      ) as keyof BillSearchByDateDTO | undefined;
    } else {
      const receivableSearch = searchByDate as ReceivableSearchByDateDTO;
      key = (
        receivableSearch.receivableDate
          ? 'receivableDate'
          : receivableSearch.receivalDate
          ? 'receivalDate'
          : undefined
      ) as keyof ReceivableSearchByDateDTO | undefined;
    }

    return key;
  }

  private normalizeToStartOfDay(date: number): number {
    const dateToFormat = new Date(date);
    dateToFormat.setHours(0, 0, 0, 0);
    return dateToFormat.getTime();
  }

  private applyExaclyDate<T extends BillDTO | ReceivableDTO>({
    listToIncludeSearchItems,
    dateFilter,
    key,
  }: {
    listToIncludeSearchItems: ListToIncludeSearchItems<T>;
    dateFilter: SearchByDate;
    key: keyof T;
  }) {
    const exactDate = this.normalizeToStartOfDay(
      Number(dateFilter.exactlyDate),
    );

    listToIncludeSearchItems.push((item) => {
      const itemDate = this.normalizeToStartOfDay(Number(item[key]));
      return itemDate === exactDate;
    });
  }

  private applyInitialAndFinalDate<T extends BillDTO | ReceivableDTO>({
    listToIncludeSearchItems,
    dateFilter,
    key,
  }: {
    listToIncludeSearchItems: ListToIncludeSearchItems<T>;
    dateFilter: SearchByDate;
    key: keyof T;
  }) {
    const initialDate = dateFilter.initialDate
      ? this.normalizeToStartOfDay(Number(dateFilter.initialDate))
      : -Infinity;
    const finalDate = dateFilter.finalDate
      ? this.normalizeToStartOfDay(Number(dateFilter.finalDate))
      : Infinity;

    listToIncludeSearchItems.push((item) => {
      const date = this.normalizeToStartOfDay(Number(item[key]));
      return date >= initialDate && date <= finalDate;
    });
  }

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
  }): void {
    const key = this.defineKey(searchByDate.typeDTO, searchByDate.invoiceType);
    if (!key) return;

    if (!Object.prototype.hasOwnProperty.call(searchByDate.typeDTO, key))
      return;

    const dateFilter =
      searchByDate.typeDTO[key as keyof typeof searchByDate.typeDTO];

    if (!dateFilter) return;

    if ('exactlyDate' in dateFilter) {
      this.applyExaclyDate({
        dateFilter,
        key: key as keyof T,
        listToIncludeSearchItems,
      });
    } else {
      this.applyInitialAndFinalDate({
        dateFilter,
        key: key as keyof T,
        listToIncludeSearchItems,
      });
    }
  }
}
