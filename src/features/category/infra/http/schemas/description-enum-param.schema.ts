import { IsIn } from 'class-validator';
import {
  CategoryDescription,
  CategoryDescriptionEnum,
} from '@/features/category/domain/enums/category-description.enum';

const DESCRIPTION_ENUMS = Object.values(CategoryDescriptionEnum);

export class DescriptionEnumParamSchema {
  @IsIn(DESCRIPTION_ENUMS, {
    message: 'O identificador da categoria (descriptionEnum) é inválido.',
  })
  descriptionEnum!: CategoryDescription;
}
