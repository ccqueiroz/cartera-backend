import { CategoryOutput } from '@/features/category/domain/category.entity';
import { CategoryRepository } from '@/features/category/domain/ports/category.repository.port';
import { CategoryType } from '@/features/category/domain/enums/category-type.enum';
import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const TYPES = new Set<string>(Object.values(CategoryType));

export class ListCategoriesByTypeUseCase {
  private constructor(private readonly repository: CategoryRepository) {}

  public static create(
    repository: CategoryRepository,
  ): ListCategoriesByTypeUseCase {
    return new ListCategoriesByTypeUseCase(repository);
  }

  public async execute(input: { type: string }): Promise<CategoryOutput[]> {
    if (!TYPES.has(input.type))
      throw new ValidationError(ErrorCode.INVALID_CATEGORY_TYPE);

    const categories = await this.repository.findActiveByType(
      input.type as CategoryType,
    );
    return categories.map((category) => category.toOutput());
  }
}
