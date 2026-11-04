import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import {
  PaymentMethodDescription,
  PaymentMethodDescriptionEnum,
} from '@/features/payment-method/domain/enums/payment-method-description.enum';

const DESCRIPTION_ENUMS = Object.values(PaymentMethodDescriptionEnum);

export class CreatePaymentMethodSchema {
  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'A descrição',
    }),
  })
  @IsNotEmpty({
    message: errorCatalog[ErrorCode.ATTRIBUTE_IS_REQUIRED_FEMININE]({
      attribute: 'A descrição',
    }),
  })
  @MaxLength(60, {
    message: errorCatalog[ErrorCode.ATTRIBUTE_EXCEEDS_MAX_LENGTH]({
      attribute: 'A descrição',
      max: 60,
    }),
  })
  description!: string;

  @IsIn(DESCRIPTION_ENUMS, {
    message: errorCatalog[ErrorCode.ATTRIBUTE_IS_INVALID_MASCULINE]({
      attribute: 'O identificador da forma de pagamento (descriptionEnum)',
    }),
  })
  descriptionEnum!: PaymentMethodDescription;
}
