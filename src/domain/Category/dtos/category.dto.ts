import { CategoryDescriptionEnum } from '../enums/category-description.enum';
import { BaseDto } from '@/domain/dtos/baseDto.dto';
import { CategoryType } from '../enums/category-type.enum';
import { CategoryGroupEnum } from '../enums/category-group.enum';

export type CategoryDescriptionEnumType =
  (typeof CategoryDescriptionEnum)[keyof typeof CategoryDescriptionEnum];

export type CategoryGroupEnumType =
  (typeof CategoryGroupEnum)[keyof typeof CategoryGroupEnum];

export type CategoryDTO = {
  id: string;
  description: string;
  descriptionEnum: CategoryDescriptionEnumType;
  group: CategoryGroupEnumType;
  type: CategoryType;
} & BaseDto;

export type GetCategoriesInputDTO = { type?: CategoryType };

export type GetCategoryByIdInputDTO = Pick<CategoryDTO, 'id'>;
