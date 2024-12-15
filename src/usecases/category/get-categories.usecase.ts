import { OutputDTO } from '@/domain/dtos/output.dto';
import { Usecase } from '../usecase';
import { CategoryDTO } from '@/domain/Category/dtos/category.dto';
import { CategoryGateway } from '@/domain/Category/gateway/category.gateway';

export type GetCategoriesInputDTO = void;

export type GetCategoriesOutputDTO = OutputDTO<Array<CategoryDTO>>;

export class GetCategoriesUseCase
  implements Usecase<GetCategoriesInputDTO, GetCategoriesOutputDTO>
{
  private constructor(private readonly categoryGateway: CategoryGateway) {}

  public static create({
    categoryGateway,
  }: {
    categoryGateway: CategoryGateway;
  }) {
    return new GetCategoriesUseCase(categoryGateway);
  }

  public async execute(): Promise<GetCategoriesOutputDTO> {
    const categories = await this.categoryGateway.getCategories();

    return {
      data: categories,
    };
  }
}
