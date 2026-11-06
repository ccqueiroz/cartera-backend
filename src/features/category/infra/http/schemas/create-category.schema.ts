import { IsEnum, IsIn, IsNotEmpty, IsString } from 'class-validator';
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
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

export class CreateCategorySchema {
  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'A descrição',
    }),
  })
  @IsNotEmpty({
    message: errorCatalog[ErrorCode.ATTRIBUTE_IS_REQUIRED_FEMININE]({
      attribute: 'A descrição',
    }),
  })
  description!: string;

  @IsIn(DESCRIPTION_ENUMS, {
    message: errorCatalog[ErrorCode.ATTRIBUTE_IS_INVALID_MASCULINE]({
      attribute: 'O identificador da categoria (descriptionEnum)',
    }),
  })
  descriptionEnum!: CategoryDescription;

  @IsIn(GROUPS, {
    message: errorCatalog[ErrorCode.INVALID_CATEGORY_GROUP](),
  })
  group!: CategoryGroup;

  @IsEnum(TransactionTypeEnum, {
    message: errorCatalog[ErrorCode.INVALID_CATEGORY_TYPE](),
  })
  type!: TransactionType;
}
