import { IsOptional, IsString } from 'class-validator';
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

/** Os 3 pares do PaginationParams que o REJECT_UNKNOWN das listas por período deixa passar. */
export class ListParamsSchema {
  @IsOptional()
  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'ordering',
    }),
  })
  ordering?: string;

  @IsOptional()
  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'direction_order',
    }),
  })
  direction_order?: string;

  @IsOptional()
  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'sort',
    }),
  })
  sort?: string;

  @IsOptional()
  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'sort_value',
    }),
  })
  sort_value?: string;

  @IsOptional()
  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'search_by_date',
    }),
  })
  search_by_date?: string;

  @IsOptional()
  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'search_by_date_value',
    }),
  })
  search_by_date_value?: string;
}
