import { OutputDTO } from '@/domain/dtos/output.dto';
import { Usecase } from '../usecase';
import {
  CategoryDTO,
  GetCategoriesInputDTO,
} from '@/domain/Category/dtos/category.dto';
import { CategoryGateway } from '@/domain/Category/gateway/category.gateway';

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

  public async execute({
    type,
  }: Partial<GetCategoriesInputDTO> = {}): Promise<GetCategoriesOutputDTO> {
    const categories = await this.categoryGateway.getCategories({ type });

    return {
      data: categories,
    };
  }
}

// O usecase chama o service -> service verifica se existe o dado no cache, caso não tenha, chama o banco de dados, salva o dado em cache e depois envia os dados para o usecase.
