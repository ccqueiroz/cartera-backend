import { IsEnum } from 'class-validator';
import { CategoryType } from '@/features/category/domain/enums/category-type.enum';

export class TypeQuerySchema {
  @IsEnum(CategoryType, { message: 'Tipo de categoria inválido.' })
  type!: CategoryType;
}
