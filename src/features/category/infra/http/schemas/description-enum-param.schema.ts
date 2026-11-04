import { IsIn } from 'class-validator';
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import {
  CategoryDescription,
  CategoryDescriptionEnum,
} from '@/features/category/domain/enums/category-description.enum';

const DESCRIPTION_ENUMS = Object.values(CategoryDescriptionEnum);

export class DescriptionEnumParamSchema {
  @IsIn(DESCRIPTION_ENUMS, {
    message: errorCatalog[ErrorCode.ATTRIBUTE_IS_INVALID_MASCULINE]({
      attribute: 'O identificador da categoria (descriptionEnum)',
    }),
  })
  descriptionEnum!: CategoryDescription;
}
