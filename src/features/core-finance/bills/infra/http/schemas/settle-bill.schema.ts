import { IsIn, IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { PAYMENT_METHOD_ENUMS } from '@/features/core-finance/bills/infra/http/schemas/payment-method-enums';

export class SettleBillSchema {
  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'A carteira',
    }),
  })
  @IsNotEmpty({
    message: errorCatalog[ErrorCode.ATTRIBUTE_IS_REQUIRED_ON_SETTLEMENT]({
      attribute: 'A carteira',
    }),
  })
  walletId!: string;

  @IsNumber(
    {},
    {
      message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_NUMBER]({
        attribute: 'O valor pago',
      }),
    },
  )
  paidAmount!: number;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_DATE]({
      attribute: 'A data de pagamento',
    }),
  })
  paymentDate!: string;

  @IsIn(PAYMENT_METHOD_ENUMS, {
    message: errorCatalog[ErrorCode.INVALID_PAYMENT_METHOD](),
  })
  paymentMethodDescriptionEnum!: string;
}
