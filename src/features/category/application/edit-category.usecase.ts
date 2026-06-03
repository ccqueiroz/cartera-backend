import { Category } from '@/features/category/domain/category.entity';
import { CategoryRepository } from '@/features/category/domain/ports/category.repository.port';
import { CategoryDescription } from '@/features/category/domain/enums/category-description.enum';
import { CategoryGroup } from '@/features/category/domain/enums/category-group.enum';
import { TransactionType } from '@/shared/kernel/enums/transaction-type.enum';
import {
  BusinessRuleViolationError,
  EntityNotFoundError,
} from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

interface EditCategoryInput {
  descriptionEnum: CategoryDescription;
  description: string;
  group: CategoryGroup;
  type: TransactionType;
  requestedDescriptionEnum?: string;
}

export class EditCategoryUseCase {
  private constructor(
    private readonly repository: CategoryRepository,
    private readonly now: () => string,
  ) {}

  public static create(
    repository: CategoryRepository,
    now: () => string,
  ): EditCategoryUseCase {
    return new EditCategoryUseCase(repository, now);
  }

  public async execute(input: EditCategoryInput): Promise<Category> {
    if (
      input.requestedDescriptionEnum &&
      input.requestedDescriptionEnum !== input.descriptionEnum
    )
      throw new BusinessRuleViolationError(
        ErrorCode.CATEGORY_DESCRIPTION_ENUM_IMMUTABLE,
      );

    const category = await this.repository.findActiveByEnum(
      input.descriptionEnum,
    );
    if (!category)
      throw new EntityNotFoundError(ErrorCode.CATEGORY_NOT_FOUND, {
        descriptionEnum: input.descriptionEnum,
      });

    category.edit({
      description: input.description,
      group: input.group,
      type: input.type,
      updatedAt: this.now(),
    });
    await this.repository.update(category);
    return category;
  }
}
