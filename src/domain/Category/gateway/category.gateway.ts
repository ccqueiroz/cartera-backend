import { CategoryDTO } from '../dtos/category.dto';

export interface CategoryGateway {
  getCategories(): Promise<Array<CategoryDTO>>;
  getCategoryById({ id }: Pick<CategoryDTO, 'id'>): Promise<CategoryDTO | null>;
}
