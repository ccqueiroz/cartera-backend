import { OutputDTO } from '@/domain/dtos/output.dto';
import { Usecase } from '../usecase';
import {
  CategoryDTO,
  GetCategoriesInputDTO,
} from '@/domain/Category/dtos/category.dto';
import { CategoryServiceGateway } from '@/domain/Category/gateway/category.service.gateway';

export type GetCategoriesOutputDTO = OutputDTO<Array<CategoryDTO>>;

export class GetCategoriesUseCase
  implements Usecase<GetCategoriesInputDTO, GetCategoriesOutputDTO>
{
  private constructor(
    private readonly categoryService: CategoryServiceGateway,
  ) {}

  public static create({
    categoryService,
  }: {
    categoryService: CategoryServiceGateway;
  }) {
    return new GetCategoriesUseCase(categoryService);
  }

  public async execute({
    type,
  }: GetCategoriesInputDTO): Promise<GetCategoriesOutputDTO> {
    const categories = await this.categoryService.getCategories({ type });

    return {
      data: categories,
    };
  }
}
