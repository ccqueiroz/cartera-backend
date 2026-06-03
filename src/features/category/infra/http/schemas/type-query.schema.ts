import { IsEnum } from 'class-validator';
import {
  TransactionType,
  TransactionTypeEnum,
} from '@/shared/kernel/enums/transaction-type.enum';

export class TypeQuerySchema {
  @IsEnum(TransactionTypeEnum, { message: 'Tipo de categoria inválido.' })
  type!: TransactionType;
}
