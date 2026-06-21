import { IsIn, IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';
import { PAYMENT_METHOD_ENUMS } from '@/features/core-finance/bills/infra/http/schemas/payment-method-enums';

export class SettleBillSchema {
  @IsString({ message: 'A carteira deve ser um texto.' })
  @IsNotEmpty({ message: 'A carteira é obrigatória na liquidação.' })
  walletId!: string;

  @IsNumber({}, { message: 'O valor pago deve ser um número.' })
  paidAmount!: number;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'A data de pagamento deve estar no formato YYYY-MM-DD.',
  })
  paymentDate!: string;

  @IsIn(PAYMENT_METHOD_ENUMS, { message: 'Forma de pagamento inválida.' })
  paymentMethodDescriptionEnum!: string;
}
