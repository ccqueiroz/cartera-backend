import { BaseDto } from '@/domain/dtos/baseDto.dto';
import { CategoryType } from '../enums/category-type.enum';

export type CategoryDTO = {
  id: string;
  description: string;
  type: CategoryType;
} & BaseDto;

export type GetCategoriesInputDTO = { type?: CategoryType };

export type GetCategoryByIdInputDTO = Pick<CategoryDTO, 'id'>;
