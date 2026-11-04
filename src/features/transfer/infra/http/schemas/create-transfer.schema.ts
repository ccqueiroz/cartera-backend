import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

/**
 * Conjunto fechado das formas de pagamento aceitas no payload. A validação de
 * borda só confere que a chave é conhecida; se está ativa no catálogo é decidido
 * pelo gateway no usecase (422). Lista própria da feature para não importar o
 * enum de payment-method (fronteira de feature / arch-guard).
 */
const PAYMENT_METHOD_ENUMS = [
  'DEBIT_CARD',
  'CREDIT_CARD',
  'BANK_SLIP',
  'BANK_DEPOSIT',
  'BANK_TRANSFER',
  'AUTOMATIC_DEBIT',
  'BOOKLET',
  'CASH',
  'CHECK',
  'PROMISSORY',
  'FINANCING',
  'MEAL_VOUCHER',
  'FOOD_VOUCHER',
  'PIX',
  'CRYPTOCURRENCY',
  'DIGITAL_WALLET',
];

export class CreateTransferSchema {
  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'A carteira de origem',
    }),
  })
  @IsNotEmpty({
    message: errorCatalog[ErrorCode.ATTRIBUTE_IS_REQUIRED_FEMININE]({
      attribute: 'A carteira de origem',
    }),
  })
  fromWalletId!: string;

  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'A carteira de destino',
    }),
  })
  @IsNotEmpty({
    message: errorCatalog[ErrorCode.ATTRIBUTE_IS_REQUIRED_FEMININE]({
      attribute: 'A carteira de destino',
    }),
  })
  toWalletId!: string;

  @IsNumber(
    {},
    {
      message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_NUMBER]({
        attribute: 'O valor da transferência',
      }),
    },
  )
  amount!: number;

  @IsIn(PAYMENT_METHOD_ENUMS, {
    message: errorCatalog[ErrorCode.ATTRIBUTE_IS_INVALID_FEMININE]({
      attribute: 'A forma de pagamento informada',
    }),
  })
  paymentMethodDescriptionEnum!: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_DATE]({
      attribute: 'A data da transferência',
    }),
  })
  transferDate?: string;
}
