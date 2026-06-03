import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  CategoryDescription,
  CategoryDescriptionEnum,
} from '@/features/category/domain/enums/category-description.enum';
import {
  CategoryGroup,
  CategoryGroupEnum,
} from '@/features/category/domain/enums/category-group.enum';
import {
  TransactionType,
  TransactionTypeEnum,
} from '@/shared/kernel/enums/transaction-type.enum';

const DESCRIPTION_ENUMS = Object.values(CategoryDescriptionEnum);
const GROUPS = Object.values(CategoryGroupEnum);

export class EditCategorySchema {
  @IsString({ message: 'A descrição deve ser um texto.' })
  @IsNotEmpty({ message: 'A descrição é obrigatória.' })
  description!: string;

  @IsIn(GROUPS, { message: 'Grupo de categoria inválido.' })
  group!: CategoryGroup;

  @IsEnum(TransactionTypeEnum, { message: 'Tipo de categoria inválido.' })
  type!: TransactionType;

  // Aceito mas imutável: trocá-lo é rejeitado no use case com 422, não aqui.
  @IsOptional()
  @IsIn(DESCRIPTION_ENUMS, {
    message: 'O identificador da categoria (descriptionEnum) é inválido.',
  })
  descriptionEnum?: CategoryDescription;
}
