import { OutputDTO } from '@/domain/dtos/output.dto';
import { Usecase } from '../usecase';
import {
  CategoryDTO,
  GetCategoryByIdInputDTO,
} from '@/domain/Category/dtos/category.dto';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { CategoryServiceGateway } from '@/domain/Category/gateway/category.service.gateway';

export type GetCategoryByIdOutputDTO = OutputDTO<CategoryDTO | null>;

export class GetCategoryByIdUseCase
  implements Usecase<GetCategoryByIdInputDTO, GetCategoryByIdOutputDTO>
{
  private constructor(
    private readonly categoryService: CategoryServiceGateway,
  ) {}

  public static create({
    categoryService,
  }: {
    categoryService: CategoryServiceGateway;
  }) {
    return new GetCategoryByIdUseCase(categoryService);
  }

  public async execute({
    id,
  }: GetCategoryByIdInputDTO): Promise<GetCategoryByIdOutputDTO> {
    if (!id) {
      throw new ApiError(ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS, 400);
    }

    const category = await this.categoryService.getCategoryById({
      id,
    });

    return {
      data: category,
    };
  }
}
