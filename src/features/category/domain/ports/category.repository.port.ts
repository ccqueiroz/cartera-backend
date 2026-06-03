import { Category } from '@/features/category/domain/category.entity';
import { CategoryDescription } from '@/features/category/domain/enums/category-description.enum';
import { CategoryGroup } from '@/features/category/domain/enums/category-group.enum';
import { TransactionType } from '@/shared/kernel/enums/transaction-type.enum';

export interface CategoryRepository {
  findActiveByType(type: TransactionType): Promise<Category[]>;
  findActiveByEnum(
    descriptionEnum: CategoryDescription,
  ): Promise<Category | null>;
  findByEnum(descriptionEnum: CategoryDescription): Promise<Category | null>;
  listGroupsByType(type: TransactionType): Promise<CategoryGroup[]>;
  findActiveByGroupAndType(
    group: CategoryGroup,
    type: TransactionType,
  ): Promise<Category[]>;
  create(category: Category): Promise<void>;
  update(category: Category): Promise<void>;
  softDelete(category: Category): Promise<void>;
}
