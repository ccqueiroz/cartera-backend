import { IsIn } from 'class-validator';
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import {
  CategoryGroup,
  CategoryGroupEnum,
} from '@/features/category/domain/enums/category-group.enum';

const GROUPS = Object.values(CategoryGroupEnum);

export class GroupParamSchema {
  @IsIn(GROUPS, {
    message: errorCatalog[ErrorCode.INVALID_CATEGORY_GROUP](),
  })
  group!: CategoryGroup;
}
