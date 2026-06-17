import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

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
  @IsString({ message: 'A carteira de origem deve ser um texto.' })
  @IsNotEmpty({ message: 'A carteira de origem é obrigatória.' })
  fromWalletId!: string;

  @IsString({ message: 'A carteira de destino deve ser um texto.' })
  @IsNotEmpty({ message: 'A carteira de destino é obrigatória.' })
  toWalletId!: string;

  @IsNumber({}, { message: 'O valor da transferência deve ser um número.' })
  amount!: number;

  @IsIn(PAYMENT_METHOD_ENUMS, {
    message: 'A forma de pagamento informada é inválida.',
  })
  paymentMethodDescriptionEnum!: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'A data da transferência deve estar no formato YYYY-MM-DD.',
  })
  transferDate?: string;
}
