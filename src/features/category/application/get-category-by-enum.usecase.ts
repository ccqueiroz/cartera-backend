import { CategoryOutput } from '@/features/category/domain/category.entity';
import { CategoryRepository } from '@/features/category/domain/ports/category.repository.port';
import {
  CategoryDescription,
  CategoryDescriptionEnum,
} from '@/features/category/domain/enums/category-description.enum';
import {
  EntityNotFoundError,
  ValidationError,
} from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const DESCRIPTION_ENUMS = new Set<string>(
  Object.values(CategoryDescriptionEnum),
);

export class GetCategoryByEnumUseCase {
  private constructor(private readonly repository: CategoryRepository) {}

  public static create(
    repository: CategoryRepository,
  ): GetCategoryByEnumUseCase {
    return new GetCategoryByEnumUseCase(repository);
  }

  public async execute(input: {
    descriptionEnum: string;
  }): Promise<CategoryOutput> {
    if (!DESCRIPTION_ENUMS.has(input.descriptionEnum))
      throw new ValidationError(ErrorCode.INVALID_CATEGORY_DESCRIPTION_ENUM);

    const category = await this.repository.findActiveByEnum(
      input.descriptionEnum as CategoryDescription,
    );
    if (!category)
      throw new EntityNotFoundError(ErrorCode.CATEGORY_NOT_FOUND, {
        descriptionEnum: input.descriptionEnum,
      });

    return category.toOutput();
  }
}
