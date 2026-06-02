import { Category } from '@/features/category/domain/category.entity';
import { CategoryRepository } from '@/features/category/domain/ports/category.repository.port';
import { CategoryDescription } from '@/features/category/domain/enums/category-description.enum';
import { CategoryGroup } from '@/features/category/domain/enums/category-group.enum';
import { CategoryType } from '@/features/category/domain/enums/category-type.enum';
import { DuplicateEntityError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

interface CreateCategoryInput {
  description: string;
  descriptionEnum: CategoryDescription;
  group: CategoryGroup;
  type: CategoryType;
}

export interface CreateCategoryResult {
  category: Category;
  reactivated: boolean;
}

export class CreateCategoryUseCase {
  private constructor(
    private readonly repository: CategoryRepository,
    private readonly generateId: () => string,
    private readonly now: () => string,
  ) {}

  public static create(
    repository: CategoryRepository,
    generateId: () => string,
    now: () => string,
  ): CreateCategoryUseCase {
    return new CreateCategoryUseCase(repository, generateId, now);
  }

  public async execute(
    input: CreateCategoryInput,
  ): Promise<CreateCategoryResult> {
    const existing = await this.repository.findByEnum(input.descriptionEnum);

    if (existing?.isActive)
      throw new DuplicateEntityError(ErrorCode.CATEGORY_ALREADY_EXISTS, {
        descriptionEnum: input.descriptionEnum,
      });

    if (existing) {
      existing.reactivate(this.now());
      await this.repository.update(existing);
      return { category: existing, reactivated: true };
    }

    const category = Category.create({
      id: this.generateId(),
      description: input.description,
      descriptionEnum: input.descriptionEnum,
      group: input.group,
      type: input.type,
      createdAt: this.now(),
    });
    await this.repository.create(category);
    return { category, reactivated: false };
  }
}
