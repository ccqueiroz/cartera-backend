import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  Matches,
} from 'class-validator';
import { WalletAdjustOperation } from '@/features/wallet/application/adjust-balance.usecase';

export class AdjustBalanceSchema {
  @IsEnum(WalletAdjustOperation, {
    message: 'A operação deve ser DEPOSIT ou WITHDRAW.',
  })
  operation!: WalletAdjustOperation;

  @IsNumber({}, { message: 'O valor deve ser um número.' })
  @IsPositive({ message: 'O valor do ajuste deve ser maior que zero.' })
  amount!: number;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'A data deve estar no formato YYYY-MM-DD.',
  })
  occurredAt?: string;
}
