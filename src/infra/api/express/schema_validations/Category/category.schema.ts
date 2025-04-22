import {
  IsString,
  IsDefined,
  IsEnum,
  MaxLength,
} from '@/packages/clients/class-validator';

export enum CategoryTypeEnum {
  BILLS,
  RECEIVABLE,
}

export class GetCategoriesValidationDTO {
  @IsDefined()
  @IsEnum(CategoryTypeEnum)
  type!: CategoryTypeEnum;
}

export class GetCategoryByIdValidationDTO {
  @IsDefined()
  @IsString()
  @MaxLength(60)
  id!: string;
}
