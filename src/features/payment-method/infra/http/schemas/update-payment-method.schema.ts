import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

export class UpdatePaymentMethodSchema {
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
}
