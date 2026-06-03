import { IsIn } from 'class-validator';
import {
  PaymentMethodDescription,
  PaymentMethodDescriptionEnum,
} from '@/features/payment-method/domain/enums/payment-method-description.enum';

const DESCRIPTION_ENUMS = Object.values(PaymentMethodDescriptionEnum);

export class DescriptionEnumParamSchema {
  @IsIn(DESCRIPTION_ENUMS, {
    message:
      'O identificador da forma de pagamento (descriptionEnum) é inválido.',
  })
  descriptionEnum!: PaymentMethodDescription;
}
