import { IsOptional, IsString, Matches } from 'class-validator';
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Borda mínima de UC-RV11: só a janela de datas + paginação opcional. */
export class ListUnreceivedByPeriodSchema {
  @Matches(DATE, {
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_DATE]({
      attribute: 'start_date',
    }),
  })
  start_date!: string;

  @Matches(DATE, {
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_DATE]({
      attribute: 'end_date',
    }),
  })
  end_date!: string;

  @IsOptional()
  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_NUMERIC_TEXT]({
      attribute: 'page',
    }),
  })
  page?: string;

  @IsOptional()
  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_NUMERIC_TEXT]({
      attribute: 'size',
    }),
  })
  size?: string;
}
