import {
  IsString,
  MaxLength,
  IsDefined,
  IsBoolean,
  IsNumber,
  IsUrl,
  IsOptional,
  IsEnum,
  ValidateNested,
  Type,
  ValidateIf,
  OnlyOnePropertieDefined,
  IsIn,
} from '@/packages/clients/class-validator';
import { UserIdAuthValidation } from '../Auth/auth.schema';
import { SortOrder } from '@/domain/dtos/listParamsDto.dto';
import { SortByStatusDTO } from '../Common/sort-by-status.schema';
import { SearchByDateDTO } from '../Common/search-by-date.schema';
import { CategoryDescriptionEnum } from '@/domain/Category/enums/category-description.enum';
import { PaymentMethodDescriptionEnum } from '@/domain/Payment_Method/enums/payment-method-description.enum';

class ReceivableCommomValidations extends UserIdAuthValidation {
  @IsDefined()
  @IsString()
  @MaxLength(60)
  personUserId!: string;

  @IsDefined()
  @IsString()
  @MaxLength(60)
  userId!: string;

  @IsDefined()
  @IsString()
  @MaxLength(255)
  descriptionReceivable!: string;

  @IsDefined()
  @IsBoolean()
  fixedReceivable!: boolean;

  @IsOptional()
  @IsNumber()
  receivableDate!: number | null;

  @IsOptional()
  @IsNumber()
  receivalDate!: number | null;

  @IsDefined()
  @IsBoolean()
  receival!: boolean;

  @IsOptional()
  @IsString()
  @IsUrl()
  icon!: string | null;

  @IsDefined()
  @IsNumber({ maxDecimalPlaces: 3 })
  amount!: number;

  @IsDefined()
  @IsString()
  @MaxLength(60)
  categoryId!: string;

  @IsDefined()
  @IsString()
  @MaxLength(255)
  categoryDescription!: string;

  @IsDefined()
  @IsString()
  @MaxLength(255)
  @IsIn(Object.values(CategoryDescriptionEnum))
  categoryDescriptionEnum!: keyof typeof CategoryDescriptionEnum;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  paymentMethodId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  paymentMethodDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @IsIn(Object.values(PaymentMethodDescriptionEnum))
  paymentMethodDescriptionEnum?: keyof typeof PaymentMethodDescriptionEnum;
}

export class CreateReceivableValidationDTO extends ReceivableCommomValidations {}

export class EditReceivableValidationDTO extends ReceivableCommomValidations {
  @IsDefined()
  @IsString()
  @MaxLength(60)
  id!: string;

  @IsDefined()
  @IsNumber()
  createdAt!: number;
}

export class EditReceivableByMonthValidationDTO {
  @IsDefined()
  @IsString()
  @MaxLength(60)
  id!: string;

  @IsDefined()
  @IsString()
  @MaxLength(60)
  personUserId!: string;

  @IsOptional()
  @IsNumber()
  receivalDate!: number | null;

  @IsDefined()
  @IsBoolean()
  receival!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  paymentMethodId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  paymentMethodDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @IsIn(Object.values(PaymentMethodDescriptionEnum))
  paymentMethodDescriptionEnum?: keyof typeof PaymentMethodDescriptionEnum;
}

export class GetReceivableByIdValidationDTO extends UserIdAuthValidation {
  @IsDefined()
  @IsString()
  @MaxLength(60)
  id!: string;
}

export class DeleteReceivableValidationDTO extends GetReceivableByIdValidationDTO {}

class SortByReceivableTypeDTO {
  @IsOptional()
  @IsBoolean()
  fixedReceivable?: boolean;

  @IsOptional()
  @IsBoolean()
  receival?: boolean;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  amount?: number;
}

class SearchByDateGetReceivablesTypeDTO {
  @ValidateIf((i) => i.receivableDate && !i.receivalDate)
  @ValidateNested()
  @Type(() => SearchByDateDTO)
  receivableDate?: SearchByDateDTO;

  @ValidateIf((i) => i.receivableDate && !i.receivalDate)
  @ValidateNested()
  @Type(() => SearchByDateDTO)
  receivalDate?: SearchByDateDTO;

  @OnlyOnePropertieDefined(['receivableDate', 'receivalDate'])
  oneOfValidator?: string;
}

class OrderByDTO {
  @IsOptional()
  @IsEnum(SortOrder)
  amount?: SortOrder;

  @IsOptional()
  @IsEnum(SortOrder)
  receivableDate?: SortOrder;

  @IsOptional()
  @IsEnum(SortOrder)
  receivalDate?: SortOrder;

  @IsOptional()
  @IsEnum(SortOrder)
  category?: SortOrder;

  @IsOptional()
  @IsEnum(SortOrder)
  categoryGroup?: SortOrder;

  @IsOptional()
  @IsEnum(SortOrder)
  paymentMethod?: SortOrder;

  @IsOptional()
  @IsEnum(SortOrder)
  paymentStatus?: SortOrder;

  @IsOptional()
  @IsEnum(SortOrder)
  createdAt?: SortOrder;

  @IsOptional()
  @IsEnum(SortOrder)
  updatedAt?: SortOrder;

  @OnlyOnePropertieDefined([
    'amount',
    'receivableDate',
    'receivalDate',
    'category',
    'categoryGroup',
    'paymentMethod',
    'paymentStatus',
    'createdAt',
    'updatedAt',
  ])
  oneOfValidator?: string;
}

export class GetReceivablesInputValidationDTO extends UserIdAuthValidation {
  @IsNumber()
  page!: number;

  @IsNumber()
  size!: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => SortByStatusDTO)
  sort?: SortByStatusDTO;

  @IsOptional()
  @ValidateNested()
  @Type(() => SortByReceivableTypeDTO)
  sortByReceivables?: SortByReceivableTypeDTO;

  @IsOptional()
  @ValidateNested()
  @Type(() => SearchByDateGetReceivablesTypeDTO)
  searchByDate?: SearchByDateGetReceivablesTypeDTO;

  @IsOptional()
  @ValidateNested()
  @Type(() => OrderByDTO)
  ordering?: OrderByDTO;
}

export class GetReceivablesByMonthDTO extends UserIdAuthValidation {
  @IsDefined()
  @IsNumber()
  initialDate!: number;

  @IsDefined()
  @IsNumber()
  finalDate!: number;

  @IsNumber()
  page!: number;

  @IsNumber()
  size!: number;
}
