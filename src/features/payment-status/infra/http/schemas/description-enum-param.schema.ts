import { IsIn } from 'class-validator';
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import {
  PaymentStatusCode,
  PaymentStatusEnum,
} from '@/shared/kernel/enums/payment-status.enum';

const STATUS_CODES = Object.values(PaymentStatusEnum);

export class DescriptionEnumParamSchema {
  @IsIn(STATUS_CODES, {
    message: errorCatalog[ErrorCode.INVALID_PAYMENT_STATUS_CODE](),
  })
  descriptionEnum!: PaymentStatusCode;
}
