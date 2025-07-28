import { IsDefined, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { UserIdAuthValidation } from '../Auth/auth.schema';
import { CategoryTypeEnum } from '../Category/category.schema';

export class GetInvoicesByCategoriesAndPeriodValidationDTO extends UserIdAuthValidation {
  @IsDefined()
  @IsNumber()
  initialDate!: number;

  @IsDefined()
  @IsNumber()
  finalDate!: number;

  @IsDefined()
  @IsEnum(CategoryTypeEnum)
  type!: CategoryTypeEnum;

  @IsOptional()
  paid?: boolean;
}
