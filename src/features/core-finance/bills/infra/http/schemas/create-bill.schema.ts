import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { PAYMENT_METHOD_ENUMS } from '@/features/core-finance/bills/infra/http/schemas/payment-method-enums';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export class CreateBillSchema {
  @IsOptional()
  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'A pessoa',
    }),
  })
  personId?: string;

  @IsNumber(
    {},
    {
      message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_NUMBER]({
        attribute: 'O valor da despesa',
      }),
    },
  )
  amount!: number;

  @Matches(DATE, {
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_DATE]({
      attribute: 'O vencimento',
    }),
  })
  dueDate!: string;

  @IsOptional()
  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'A categoria',
    }),
  })
  categoryDescriptionEnum?: string;

  @IsOptional()
  @IsBoolean({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_BOOLEAN_MASCULINE]({
      attribute: 'O custo-fixo',
    }),
  })
  isFixedCost?: boolean;

  @IsOptional()
  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'O período',
    }),
  })
  period?: string;

  @IsOptional()
  @IsNumber(
    {},
    {
      message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_NUMBER]({
        attribute: 'A frequência',
      }),
    },
  )
  frequency?: number;

  @IsOptional()
  @IsIn(PAYMENT_METHOD_ENUMS, {
    message: errorCatalog[ErrorCode.INVALID_PAYMENT_METHOD](),
  })
  paymentMethodDescriptionEnum?: string;

  @IsOptional()
  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'O cartão',
    }),
  })
  cardId?: string;

  @IsOptional()
  @Matches(DATE, {
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_DATE]({
      attribute: 'A data de pagamento',
    }),
  })
  paidAt?: string;

  @IsOptional()
  @IsNumber(
    {},
    {
      message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_NUMBER]({
        attribute: 'O valor pago',
      }),
    },
  )
  paidAmount?: number;

  @IsOptional()
  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'A carteira',
    }),
  })
  walletId?: string;
}
