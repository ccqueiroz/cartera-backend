import { IsEnum } from 'class-validator';
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import {
  TransactionType,
  TransactionTypeEnum,
} from '@/shared/kernel/enums/transaction-type.enum';

export class TypeQuerySchema {
  @IsEnum(TransactionTypeEnum, {
    message: errorCatalog[ErrorCode.INVALID_CATEGORY_TYPE](),
  })
  type!: TransactionType;
}
