import { OutputDTO } from '@/domain/dtos/output.dto';
import { Usecase } from '../usecase';
import { CategoryDTO } from '@/domain/Category/dtos/category.dto';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { CategoryServiceGateway } from '@/domain/Category/gateway/category.service.gateway';

export type GetCategoryDescriptioIdInputDTO = Pick<
  CategoryDTO,
  'descriptionEnum'
>;

export type GetCategoryByDescriptionOutputDTO = OutputDTO<CategoryDTO | null>;

export class GetCategoryByDescriptionUseCase
  implements
    Usecase<GetCategoryDescriptioIdInputDTO, GetCategoryByDescriptionOutputDTO>
{
  private constructor(
    private readonly categoryService: CategoryServiceGateway,
  ) {}

  public static create({
    categoryService,
  }: {
    categoryService: CategoryServiceGateway;
  }) {
    return new GetCategoryByDescriptionUseCase(categoryService);
  }

  public async execute({
    descriptionEnum,
  }: GetCategoryDescriptioIdInputDTO): Promise<GetCategoryByDescriptionOutputDTO> {
    if (!descriptionEnum) {
      throw new ApiError(ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS, 400);
    }

    const category = await this.categoryService.getCategoryByDescriptionEnum({
      descriptionEnum,
    });

    if (!category || !category?.id) {
      return { data: null };
    }

    return {
      data: {
        id: category.id,
        description: category.description,
        descriptionEnum: category.descriptionEnum,
        group: category.group,
        type: category.type,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
    };
  }
}
