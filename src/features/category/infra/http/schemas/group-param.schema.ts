import { IsIn } from 'class-validator';
import {
  CategoryGroup,
  CategoryGroupEnum,
} from '@/features/category/domain/enums/category-group.enum';

const GROUPS = Object.values(CategoryGroupEnum);

export class GroupParamSchema {
  @IsIn(GROUPS, { message: 'Grupo de categoria inválido.' })
  group!: CategoryGroup;
}
