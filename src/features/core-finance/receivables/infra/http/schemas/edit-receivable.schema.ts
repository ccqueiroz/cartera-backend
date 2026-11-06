import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

export class EditReceivableSchema {
  @IsOptional()
  @IsNumber(
    {},
    {
      message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_NUMBER]({
        attribute: 'O valor',
      }),
    },
  )
  amount?: number;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_DATE]({
      attribute: 'O vencimento',
    }),
  })
  dueDate?: string;

  @IsOptional()
  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'A categoria',
    }),
  })
  categoryDescriptionEnum?: string;

  @IsOptional()
  @IsBoolean({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_BOOLEAN_FEMININE]({
      attribute: 'A propagação',
    }),
  })
  propagate?: boolean;
}
