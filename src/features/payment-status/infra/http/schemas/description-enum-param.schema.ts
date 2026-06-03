import { IsIn } from 'class-validator';
import {
  PaymentStatusCode,
  PaymentStatusEnum,
} from '@/shared/kernel/enums/payment-status.enum';

const STATUS_CODES = Object.values(PaymentStatusEnum);

export class DescriptionEnumParamSchema {
  @IsIn(STATUS_CODES, {
    message: 'O código do status de pagamento é inválido.',
  })
  descriptionEnum!: PaymentStatusCode;
}
