import {
  CategoryDTO,
  GetCategoriesInputDTO,
  GetCategoryByIdInputDTO,
} from '../dtos/category.dto';

export interface CategoryServiceGateway {
  getCategories(type: GetCategoriesInputDTO): Promise<Array<CategoryDTO>>;
  getCategoryById({ id }: GetCategoryByIdInputDTO): Promise<CategoryDTO | null>;
  getCategoryByDescriptionEnum({
    descriptionEnum,
  }: Pick<CategoryDTO, 'descriptionEnum'>): Promise<CategoryDTO | null>;
  getCategoryByGroup({
    group,
  }: Pick<CategoryDTO, 'group'>): Promise<Array<CategoryDTO>>;
}
