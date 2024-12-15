import { OutputDTO } from '@/domain/dtos/output.dto';
import { Usecase } from '../usecase';
import { CategoryDTO } from '@/domain/Category/dtos/category.dto';
import { CategoryGateway } from '@/domain/Category/gateway/category.gateway';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';

export type GetCategoryByIdInputDTO = Pick<CategoryDTO, 'id'>;

export type GetCategoryByIdOutputDTO = OutputDTO<CategoryDTO | null>;

export class GetCategoryByIdUseCase
  implements Usecase<GetCategoryByIdInputDTO, GetCategoryByIdOutputDTO>
{
  private constructor(private readonly categoryGateway: CategoryGateway) {}

  public static create({
    categoryGateway,
  }: {
    categoryGateway: CategoryGateway;
  }) {
    return new GetCategoryByIdUseCase(categoryGateway);
  }

  public async execute({
    id,
  }: GetCategoryByIdInputDTO): Promise<GetCategoryByIdOutputDTO> {
    if (!id) {
      throw new ApiError(ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS, 400);
    }

    const category = await this.categoryGateway.getCategoryById({
      id,
    });

    return {
      data: category,
    };
  }
}
