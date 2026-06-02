import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import {
  CategoryDescription,
  CategoryDescriptionEnum,
} from '@/features/category/domain/enums/category-description.enum';
import {
  CategoryGroup,
  CategoryGroupEnum,
} from '@/features/category/domain/enums/category-group.enum';
import { CategoryType } from '@/features/category/domain/enums/category-type.enum';

interface CategoryProps {
  id: string;
  description: string;
  descriptionEnum: CategoryDescription;
  group: CategoryGroup;
  type: CategoryType;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface CategoryPersistence {
  id: string;
  description: string;
  descriptionEnum: CategoryDescription;
  group: CategoryGroup;
  type: CategoryType;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface CategoryOutput {
  description: string;
  descriptionEnum: CategoryDescription;
  group: CategoryGroup;
  type: CategoryType;
  active: boolean;
  createdAt: string;
  updatedAt: string | null;
}

const DESCRIPTION_ENUMS = new Set<string>(
  Object.values(CategoryDescriptionEnum),
);
const GROUPS = new Set<string>(Object.values(CategoryGroupEnum));
const TYPES = new Set<string>(Object.values(CategoryType));

export class Category {
  private constructor(private props: CategoryProps) {}

  public static create(input: {
    id: string;
    description: string;
    descriptionEnum: CategoryDescription;
    group: CategoryGroup;
    type: CategoryType;
    createdAt: string;
  }): Category {
    const props: CategoryProps = {
      ...input,
      updatedAt: null,
      deletedAt: null,
    };
    Category.validateProps(props);
    return new Category(props);
  }

  public static with(persistence: CategoryPersistence): Category {
    return new Category({ ...persistence });
  }

  private static validateProps(props: CategoryProps): void {
    if (!props.description.trim())
      throw new ValidationError(ErrorCode.CATEGORY_DESCRIPTION_REQUIRED);
    if (!DESCRIPTION_ENUMS.has(props.descriptionEnum))
      throw new ValidationError(ErrorCode.INVALID_CATEGORY_DESCRIPTION_ENUM);
    if (!GROUPS.has(props.group))
      throw new ValidationError(ErrorCode.INVALID_CATEGORY_GROUP);
    if (!TYPES.has(props.type))
      throw new ValidationError(ErrorCode.INVALID_CATEGORY_TYPE);
  }

  public edit(input: {
    description: string;
    group: CategoryGroup;
    type: CategoryType;
    updatedAt: string;
  }): void {
    const next: CategoryProps = {
      ...this.props,
      description: input.description,
      group: input.group,
      type: input.type,
      updatedAt: input.updatedAt,
    };
    Category.validateProps(next);
    this.props = next;
  }

  public softDelete(deletedAt: string): void {
    this.props.deletedAt = deletedAt;
    this.props.updatedAt = deletedAt;
  }

  public reactivate(updatedAt: string): void {
    this.props.deletedAt = null;
    this.props.updatedAt = updatedAt;
  }

  public get id(): string {
    return this.props.id;
  }

  public get descriptionEnum(): CategoryDescription {
    return this.props.descriptionEnum;
  }

  public get isActive(): boolean {
    return this.props.deletedAt === null;
  }

  public toPersistence(): CategoryPersistence {
    return {
      id: this.props.id,
      description: this.props.description,
      descriptionEnum: this.props.descriptionEnum,
      group: this.props.group,
      type: this.props.type,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      deletedAt: this.props.deletedAt,
    };
  }

  public toOutput(): CategoryOutput {
    return {
      description: this.props.description,
      descriptionEnum: this.props.descriptionEnum,
      group: this.props.group,
      type: this.props.type,
      active: this.isActive,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
