import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { PAYMENT_METHOD_ENUMS } from '@/features/core-finance/bills/infra/http/schemas/payment-method-enums';

export class GlobalSettleBillSchema {
  @IsString({ message: 'A carteira deve ser um texto.' })
  @IsNotEmpty({ message: 'A carteira é obrigatória na quitação.' })
  walletId!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'A data de pagamento deve estar no formato YYYY-MM-DD.',
  })
  paymentDate!: string;

  @IsIn(PAYMENT_METHOD_ENUMS, { message: 'Forma de pagamento inválida.' })
  paymentMethodDescriptionEnum!: string;

  @IsOptional()
  @IsArray({ message: 'A seleção deve ser uma lista de ids.' })
  @IsString({ each: true, message: 'Cada id da seleção deve ser um texto.' })
  selection?: string[];

  @IsOptional()
  @IsNumber({}, { message: 'O valor pago deve ser um número.' })
  valorPago?: number;
}
