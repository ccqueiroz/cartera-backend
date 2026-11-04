import { IsIn } from 'class-validator';
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import {
  PaymentMethodDescription,
  PaymentMethodDescriptionEnum,
} from '@/features/payment-method/domain/enums/payment-method-description.enum';

const DESCRIPTION_ENUMS = Object.values(PaymentMethodDescriptionEnum);

export class DescriptionEnumParamSchema {
  @IsIn(DESCRIPTION_ENUMS, {
    message: errorCatalog[ErrorCode.ATTRIBUTE_IS_INVALID_MASCULINE]({
      attribute: 'O identificador da forma de pagamento (descriptionEnum)',
    }),
  })
  descriptionEnum!: PaymentMethodDescription;
}
