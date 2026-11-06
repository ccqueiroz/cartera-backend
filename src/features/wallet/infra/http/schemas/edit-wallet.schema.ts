import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

export class EditWalletSchema {
  @IsOptional()
  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'O nome',
    }),
  })
  @IsNotEmpty({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_NOT_BE_EMPTY_MASCULINE]({
      attribute: 'O nome da carteira',
    }),
  })
  name?: string;

  @IsOptional()
  @IsBoolean({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_A_BOOLEAN]({
      attribute: 'hasOverdraft',
    }),
  })
  hasOverdraft?: boolean;

  @IsOptional()
  @IsNumber(
    {},
    {
      message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_NUMBER]({
        attribute: 'O limite do cheque',
      }),
    },
  )
  @Min(0, {
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_NOT_BE_NEGATIVE_MASCULINE]({
      attribute: 'O limite do cheque',
    }),
  })
  overdraftLimit?: number;

  @IsOptional()
  @IsNumber(
    {},
    {
      message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_NUMBER]({
        attribute: 'A taxa mensal',
      }),
    },
  )
  @Min(0, {
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_NOT_BE_NEGATIVE_FEMININE]({
      attribute: 'A taxa mensal',
    }),
  })
  overdraftMonthlyRate?: number;

  @IsOptional()
  @IsInt({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_WHOLE_DAYS]({
      attribute: 'A carência',
    }),
  })
  @Min(0, {
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_NOT_BE_NEGATIVE_FEMININE]({
      attribute: 'A carência',
    }),
  })
  overdraftGraceDays?: number;
}
