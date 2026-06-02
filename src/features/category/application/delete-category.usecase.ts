import { CategoryRepository } from '@/features/category/domain/ports/category.repository.port';
import { CategoryDescription } from '@/features/category/domain/enums/category-description.enum';
import { EntityNotFoundError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

export class DeleteCategoryUseCase {
  private constructor(
    private readonly repository: CategoryRepository,
    private readonly now: () => string,
  ) {}

  public static create(
    repository: CategoryRepository,
    now: () => string,
  ): DeleteCategoryUseCase {
    return new DeleteCategoryUseCase(repository, now);
  }

  public async execute(input: {
    descriptionEnum: CategoryDescription;
  }): Promise<void> {
    const category = await this.repository.findActiveByEnum(
      input.descriptionEnum,
    );
    if (!category)
      throw new EntityNotFoundError(ErrorCode.CATEGORY_NOT_FOUND, {
        descriptionEnum: input.descriptionEnum,
      });

    category.softDelete(this.now());
    await this.repository.softDelete(category);
  }
}
