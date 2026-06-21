import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { PAYMENT_METHOD_ENUMS } from '@/features/core-finance/bills/infra/http/schemas/payment-method-enums';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export class CreateBillSchema {
  @IsOptional()
  @IsString({ message: 'A pessoa deve ser um texto.' })
  personId?: string;

  @IsNumber({}, { message: 'O valor da despesa deve ser um número.' })
  amount!: number;

  @Matches(DATE, { message: 'O vencimento deve estar no formato YYYY-MM-DD.' })
  dueDate!: string;

  @IsOptional()
  @IsString({ message: 'A categoria deve ser um texto.' })
  categoryDescriptionEnum?: string;

  @IsOptional()
  @IsBoolean({ message: 'O custo-fixo deve ser booleano.' })
  isFixedCost?: boolean;

  @IsOptional()
  @IsString({ message: 'O período deve ser um texto.' })
  period?: string;

  @IsOptional()
  @IsNumber({}, { message: 'A frequência deve ser um número.' })
  frequency?: number;

  @IsOptional()
  @IsIn(PAYMENT_METHOD_ENUMS, { message: 'Forma de pagamento inválida.' })
  paymentMethodDescriptionEnum?: string;

  @IsOptional()
  @IsString({ message: 'O cartão deve ser um texto.' })
  cardId?: string;

  @IsOptional()
  @Matches(DATE, {
    message: 'A data de pagamento deve estar no formato YYYY-MM-DD.',
  })
  paidAt?: string;

  @IsOptional()
  @IsNumber({}, { message: 'O valor pago deve ser um número.' })
  paidAmount?: number;

  @IsOptional()
  @IsString({ message: 'A carteira deve ser um texto.' })
  walletId?: string;
}
