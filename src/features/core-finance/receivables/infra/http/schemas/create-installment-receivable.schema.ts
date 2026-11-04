import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export class CreateInstallmentReceivableSchema {
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
        attribute: 'O valor total',
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

  @IsArray({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_LIST]({
      attribute: 'As parcelas',
    }),
  })
  @ArrayMinSize(1, {
    message: errorCatalog[ErrorCode.AT_LEAST_ONE_INSTALLMENT_REQUIRED](),
  })
  installments!: unknown[];

  @IsOptional()
  @IsObject({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_OBJECT]({
      attribute: 'A entrada',
    }),
  })
  entry?: unknown;
}
