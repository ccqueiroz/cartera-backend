import { BillDTO } from '@/domain/Bill/dtos/bill.dto';
import { SortByStatusInputDTO } from '@/domain/Helpers/dtos/sort-by-status-input.dto';
import {
  ApplySortStatusGateway,
  ListToIncludeSortItems,
} from '@/domain/Helpers/gateway/apply-sort-status.gateway';
import { PaymentStatusEntitie } from '@/domain/Payment_Status/entitie/payment-status.entitie';
import { ReceivableDTO } from '@/domain/Receivable/dtos/receivable.dto';

type ItemKey =
  | 'paymentStatus'
  | 'categoryDescriptionEnum'
  | 'categoryGroup'
  | 'paymentMethodDescriptionEnum';

export class ApplySortStatusHelper implements ApplySortStatusGateway {
  private possibleKeys = {
    paymentStatus: 'paymentStatus',
    category: 'categoryDescriptionEnum',
    categoryGroup: 'categoryGroup',
    paymentMethod: 'paymentMethodDescriptionEnum',
  };

  private defineKey(
    sortByStatus: SortByStatusInputDTO,
  ): keyof SortByStatusInputDTO | null {
    const keys = Object.keys(sortByStatus) as (keyof SortByStatusInputDTO)[];
    return keys.find((k) => sortByStatus[k] !== undefined) ?? null;
  }

  private getInvoiceDateItem<T extends BillDTO | ReceivableDTO>(
    item: T,
    invoiceType: 'bill' | 'receivable',
  ): number | null {
    if (invoiceType === 'bill' && 'billDate' in item) {
      return item.billDate ?? null;
    } else if (invoiceType === 'receivable' && 'receivableDate' in item) {
      return item.receivableDate ?? null;
    }
    return null;
  }

  private getWasPaidItem<T extends BillDTO | ReceivableDTO>(
    item: T,
    invoiceType: 'bill' | 'receivable',
  ): boolean {
    if (invoiceType === 'bill' && 'billDate' in item) {
      return item.payOut ?? false;
    } else if (invoiceType === 'receivable' && 'receivableDate' in item) {
      return item.receival ?? false;
    }
    return false;
  }

  private definePaymentStatus({
    invoiceType,
    item,
  }: {
    invoiceType: 'bill' | 'receivable';
    item: BillDTO | ReceivableDTO;
  }) {
    const currentDay = new Date().getTime();
    const wasPaid = this.getWasPaidItem(item, invoiceType);
    const invoiceDate = this.getInvoiceDateItem(item, invoiceType);

    if (!invoiceDate) return null;

    return PaymentStatusEntitie.setInvoiceStatus(
      wasPaid,
      invoiceDate,
      currentDay,
      invoiceType,
    );
  }

  execute<T extends BillDTO | ReceivableDTO>({
    listToIncludeSortItems,
    sortByStatus,
    invoiceType,
  }: {
    listToIncludeSortItems: ListToIncludeSortItems<T>;
    sortByStatus: SortByStatusInputDTO;
    invoiceType: 'bill' | 'receivable';
  }): void {
    const key = this.defineKey(sortByStatus);

    if (key) {
      const status = sortByStatus[key];

      const itemKey = this.possibleKeys[key] as ItemKey;

      listToIncludeSortItems.push((item) => {
        if (key !== this.possibleKeys.paymentStatus) {
          if (itemKey === this.possibleKeys.category) {
            if ('categoryDescriptionEnum' in item) {
              return item.categoryDescriptionEnum === status;
            }
            return false;
          } else if (itemKey === this.possibleKeys.categoryGroup) {
            if ('categoryGroup' in item) {
              return item.categoryGroup === status;
            }
            return false;
          } else if (itemKey === this.possibleKeys.paymentMethod) {
            if ('paymentMethodDescriptionEnum' in item) {
              return item.paymentMethodDescriptionEnum === status;
            }
            return false;
          }

          return false;
        } else {
          const paymentStatus = this.definePaymentStatus({ item, invoiceType });

          return paymentStatus === status;
        }
      });
    }
  }
}
