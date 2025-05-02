import {
  CategoryDTO,
  GetCategoriesInputDTO,
  GetCategoryByIdInputDTO,
} from '../dtos/category.dto';

export interface CategoryServiceGateway {
  getCategories(type: GetCategoriesInputDTO): Promise<Array<CategoryDTO>>;
  getCategoryById({ id }: GetCategoryByIdInputDTO): Promise<CategoryDTO | null>;
}
