import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  Matches,
} from 'class-validator';
import { WalletAdjustOperation } from '@/features/wallet/application/adjust-balance.usecase';
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

export class AdjustBalanceSchema {
  @IsEnum(WalletAdjustOperation, {
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_DEPOSIT_OR_WITHDRAW]({
      attribute: 'A operação',
    }),
  })
  operation!: WalletAdjustOperation;

  @IsNumber(
    {},
    {
      message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_NUMBER]({
        attribute: 'O valor',
      }),
    },
  )
  @IsPositive({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_GREATER_THAN_ZERO]({
      attribute: 'O valor do ajuste',
    }),
  })
  amount!: number;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_DATE]({
      attribute: 'A data',
    }),
  })
  occurredAt?: string;
}
