import { PaymentStatusDTO } from '../dtos/payment-status.dto';
import { PaymentStatusDescriptionEnum } from '../enum/payment-status-description.enum';

export type PaymentStatusProps = PaymentStatusDTO;

export class PaymentStatusEntitie {
  private constructor(private props: PaymentStatusProps) {}

  public static with(props: PaymentStatusProps) {
    return new PaymentStatusEntitie(props);
  }

  private static calcDiffDaysBetweenInvoiceDateAndReferenceDate(
    invoiceDate: number,
    referenceDate: number,
  ) {
    const milleSecondsPerDay = 1000 * 60 * 60 * 24;

    const diffInDays = Math.floor(
      (invoiceDate - referenceDate) / milleSecondsPerDay,
    );

    return diffInDays;
  }

  public static setInvoiceStatus(
    wasPaid: boolean,
    invoiceDate: number,
    referenceDate: number,
    invoiceType: 'bill' | 'receivable',
  ) {
    if (wasPaid) {
      return invoiceType === 'bill'
        ? PaymentStatusDescriptionEnum.PAID
        : PaymentStatusDescriptionEnum.RECEIVED;
    }
    const diffInDays = this.calcDiffDaysBetweenInvoiceDateAndReferenceDate(
      invoiceDate,
      referenceDate,
    );

    if (diffInDays === 0) {
      return PaymentStatusDescriptionEnum.DUE_DAY;
    }

    if (diffInDays > 0 && diffInDays <= 5) {
      return PaymentStatusDescriptionEnum.DUE_SOON;
    }

    if (diffInDays > 5) {
      return invoiceType === 'bill'
        ? PaymentStatusDescriptionEnum.TO_PAY
        : PaymentStatusDescriptionEnum.TO_RECEIVE;
    }

    return PaymentStatusDescriptionEnum.OVERDUE;
  }

  public get id() {
    return this.props.id;
  }

  public get description() {
    return this.props.description;
  }

  public get descriptionEnum() {
    return this.props.descriptionEnum;
  }

  public get createdAt() {
    return this.props.createdAt;
  }

  public get updatedAt() {
    return this.props.updatedAt;
  }
}
