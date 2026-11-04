import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { PAYMENT_METHOD_ENUMS } from '@/features/core-finance/receivables/infra/http/schemas/payment-method-enums';

export class GlobalSettleReceivableSchema {
  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'A carteira',
    }),
  })
  @IsNotEmpty({
    message: errorCatalog[ErrorCode.ATTRIBUTE_IS_REQUIRED_ON_RECEIPT]({
      attribute: 'A carteira',
    }),
  })
  walletId!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_DATE]({
      attribute: 'A data de recebimento',
    }),
  })
  paymentDate!: string;

  @IsIn(PAYMENT_METHOD_ENUMS, {
    message: errorCatalog[ErrorCode.INVALID_PAYMENT_METHOD](),
  })
  paymentMethodDescriptionEnum!: string;

  @IsOptional()
  @IsArray({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_ID_LIST]({
      attribute: 'A seleção',
    }),
  })
  @IsString({
    each: true,
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'Cada id da seleção',
    }),
  })
  selection?: string[];

  @IsOptional()
  @IsNumber(
    {},
    {
      message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_NUMBER]({
        attribute: 'O valor recebido',
      }),
    },
  )
  valorPago?: number;
}
