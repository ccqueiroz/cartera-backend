import { PaymentStatusEnum } from '@/shared/kernel/enums/payment-status.enum';
import {
  TransactionType,
  TransactionTypeEnum,
} from '@/shared/kernel/enums/transaction-type.enum';

export interface CalculatePaymentStatusInput {
  analysisDate: string | Date;
  transactionType: TransactionType;
  isPaid: boolean;
  today?: Date;
}

const DUE_SOON_MIN_DAYS = 1;
const DUE_SOON_MAX_DAYS = 5;
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

/** Status de pagamento derivado de data + direção + pago (CLAUDE.md §5, §7). Imutável. */
export class PaymentStatus {
  private constructor(private readonly _status: PaymentStatusEnum) {}

  public static calculate(input: CalculatePaymentStatusInput): PaymentStatus {
    if (input.isPaid)
      return new PaymentStatus(
        input.transactionType === TransactionTypeEnum.BILLS
          ? PaymentStatusEnum.PAID
          : PaymentStatusEnum.RECEIVED,
      );

    const diffInDays = PaymentStatus.calendarDayDiffInUtc(
      new Date(input.analysisDate),
      input.today ?? new Date(),
    );

    if (diffInDays < 0) return new PaymentStatus(PaymentStatusEnum.OVERDUE);
    if (diffInDays === 0) return new PaymentStatus(PaymentStatusEnum.DUE_DAY);
    if (diffInDays >= DUE_SOON_MIN_DAYS && diffInDays <= DUE_SOON_MAX_DAYS)
      return new PaymentStatus(PaymentStatusEnum.DUE_SOON);

    return new PaymentStatus(
      input.transactionType === TransactionTypeEnum.BILLS
        ? PaymentStatusEnum.TO_PAY
        : PaymentStatusEnum.TO_RECEIVE,
    );
  }

  private static calendarDayDiffInUtc(analysisDate: Date, today: Date): number {
    const analysisUtc = Date.UTC(
      analysisDate.getUTCFullYear(),
      analysisDate.getUTCMonth(),
      analysisDate.getUTCDate(),
    );
    const todayUtc = Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
    );
    return Math.round((analysisUtc - todayUtc) / MILLISECONDS_PER_DAY);
  }

  public get status(): PaymentStatusEnum {
    return this._status;
  }
}
