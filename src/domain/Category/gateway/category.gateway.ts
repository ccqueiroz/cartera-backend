import {
  CategoryDTO,
  GetCategoriesInputDTO,
  GetCategoryByIdInputDTO,
} from '../dtos/category.dto';

export interface CategoryGateway {
  getCategories(
    type: Partial<GetCategoriesInputDTO>,
  ): Promise<Array<CategoryDTO>>;
  getCategoryById({ id }: GetCategoryByIdInputDTO): Promise<CategoryDTO | null>;
}
