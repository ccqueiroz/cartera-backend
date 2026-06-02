import { CategoryOutput } from '@/features/category/domain/category.entity';
import { CategoryRepository } from '@/features/category/domain/ports/category.repository.port';
import {
  CategoryGroup,
  CategoryGroupEnum,
} from '@/features/category/domain/enums/category-group.enum';
import { CategoryType } from '@/features/category/domain/enums/category-type.enum';
import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const GROUPS = new Set<string>(Object.values(CategoryGroupEnum));
const TYPES = new Set<string>(Object.values(CategoryType));

export class ListCategoriesByGroupUseCase {
  private constructor(private readonly repository: CategoryRepository) {}

  public static create(
    repository: CategoryRepository,
  ): ListCategoriesByGroupUseCase {
    return new ListCategoriesByGroupUseCase(repository);
  }

  public async execute(input: {
    group: string;
    type: string;
  }): Promise<CategoryOutput[]> {
    if (!GROUPS.has(input.group))
      throw new ValidationError(ErrorCode.INVALID_CATEGORY_GROUP);
    if (!TYPES.has(input.type))
      throw new ValidationError(ErrorCode.INVALID_CATEGORY_TYPE);

    const categories = await this.repository.findActiveByGroupAndType(
      input.group as CategoryGroup,
      input.type as CategoryType,
    );
    return categories.map((category) => category.toOutput());
  }
}
