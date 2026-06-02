import { CategoryRepository } from '@/features/category/domain/ports/category.repository.port';
import { CategoryGroup } from '@/features/category/domain/enums/category-group.enum';
import { CategoryType } from '@/features/category/domain/enums/category-type.enum';
import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const TYPES = new Set<string>(Object.values(CategoryType));

export class ListGroupsByTypeUseCase {
  private constructor(private readonly repository: CategoryRepository) {}

  public static create(
    repository: CategoryRepository,
  ): ListGroupsByTypeUseCase {
    return new ListGroupsByTypeUseCase(repository);
  }

  public async execute(input: { type: string }): Promise<CategoryGroup[]> {
    if (!TYPES.has(input.type))
      throw new ValidationError(ErrorCode.INVALID_CATEGORY_TYPE);

    return this.repository.listGroupsByType(input.type as CategoryType);
  }
}
