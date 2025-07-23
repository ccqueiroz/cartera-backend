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

class InvoiceCardDataDTO {
  @IsDefined()
  @IsString()
  @MaxLength(60)
  paymentCardId!: string;

  @IsDefined()
  @IsString()
  @MaxLength(60)
  invoiceCardId!: string;
}

class ShoppingListDataDTO {
  @IsDefined()
  @IsString()
  @MaxLength(60)
  shoppingListId!: string;
}

class BillCommomValidations extends UserIdAuthValidation {
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
  descriptionBill!: string;

  @IsDefined()
  @IsBoolean()
  fixedBill!: boolean;

  @IsOptional()
  @IsNumber()
  billDate!: number | null;

  @IsOptional()
  @IsNumber()
  payDate!: number | null;

  @IsDefined()
  @IsBoolean()
  payOut!: boolean;

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

  @IsDefined()
  @IsBoolean()
  isPaymentCardBill!: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => InvoiceCardDataDTO)
  invoiceCarData?: InvoiceCardDataDTO;

  @IsDefined()
  @IsBoolean()
  isShoppingListBill!: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => ShoppingListDataDTO)
  shoppingListData?: ShoppingListDataDTO;
}

export class CreateBillValidationDTO extends BillCommomValidations {}

export class EditBillValidationDTO extends BillCommomValidations {
  @IsDefined()
  @IsString()
  @MaxLength(60)
  id!: string;

  @IsDefined()
  @IsNumber()
  createdAt!: number;
}

export class EditBillByPayableMonthValidationDTO {
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
  payDate!: number | null;

  @IsDefined()
  @IsBoolean()
  payOut!: boolean;

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

export class GetBillByIdValidationDTO extends UserIdAuthValidation {
  @IsDefined()
  @IsString()
  @MaxLength(60)
  id!: string;
}

export class DeleteBillValidationDTO extends GetBillByIdValidationDTO {}

class SortByBillTypeInputDTO {
  @IsOptional()
  @IsBoolean()
  fixedBill?: boolean;

  @IsOptional()
  @IsBoolean()
  payOut?: boolean;

  @IsOptional()
  @IsBoolean()
  isShoppingListBill?: boolean;

  @IsOptional()
  @IsBoolean()
  isPaymentCardBill?: boolean;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  amount?: number;
}

class SearchByDateGetBillsTypeDTO {
  @ValidateIf((i) => i.billDate && !i.payDate)
  @ValidateNested()
  @Type(() => SearchByDateDTO)
  billDate?: SearchByDateDTO;

  @ValidateIf((i) => i.billDate && !i.payDate)
  @ValidateNested()
  @Type(() => SearchByDateDTO)
  payDate?: SearchByDateDTO;

  @OnlyOnePropertieDefined(['billDate', 'payDate'])
  oneOfValidator?: string;
}

class OrderByDTO {
  @IsOptional()
  @IsEnum(SortOrder)
  amount?: SortOrder;

  @IsOptional()
  @IsEnum(SortOrder)
  billDate?: SortOrder;

  @IsOptional()
  @IsEnum(SortOrder)
  payDate?: SortOrder;

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
    'billDate',
    'payDate',
    'category',
    'categoryGroup',
    'paymentMethod',
    'paymentStatus',
    'createdAt',
    'updatedAt',
  ])
  oneOfValidator?: string;
}

export class GetBillsInputValidationDTO extends UserIdAuthValidation {
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
  @Type(() => SortByBillTypeInputDTO)
  sortByBills?: SortByBillTypeInputDTO;

  @IsOptional()
  @ValidateNested()
  @Type(() => SearchByDateGetBillsTypeDTO)
  searchByDate?: SearchByDateGetBillsTypeDTO;

  @IsOptional()
  @ValidateNested()
  @Type(() => OrderByDTO)
  ordering?: OrderByDTO;
}

export class GetBillsPayableMonthDTO extends UserIdAuthValidation {
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
