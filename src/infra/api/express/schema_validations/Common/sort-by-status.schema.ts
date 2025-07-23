import { CategoryDescriptionEnum } from '@/domain/Category/enums/category-description.enum';
import { CategoryGroupEnum } from '@/domain/Category/enums/category-group.enum';
import { PaymentMethodDescriptionEnum } from '@/domain/Payment_Method/enums/payment-method-description.enum';
import { PaymentStatusDescriptionEnum } from '@/domain/Payment_Status/enum/payment-status-description.enum';
import {
  IsString,
  ValidateIf,
  MaxLength,
  OnlyOnePropertieDefined,
  IsIn,
} from '@/packages/clients/class-validator';

export class SortByStatusDTO {
  @ValidateIf(
    (i) =>
      i.paymentStatus && !i.category && !i.paymentMethod && !i.categoryGroup,
  )
  @IsString()
  @MaxLength(60)
  @IsIn(Object.values(PaymentStatusDescriptionEnum))
  paymentStatus?: keyof typeof PaymentStatusDescriptionEnum;

  @ValidateIf(
    (i) =>
      i.category && !i.categoryGroup && !i.paymentStatus && !i.paymentMethod,
  )
  @IsString()
  @MaxLength(60)
  @IsIn(Object.values(CategoryDescriptionEnum))
  category?: keyof typeof CategoryDescriptionEnum;

  @ValidateIf(
    (i) =>
      i.categoryGroup && !i.category && !i.paymentStatus && !i.paymentMethod,
  )
  @IsString()
  @MaxLength(60)
  @IsIn(Object.values(CategoryGroupEnum))
  categoryGroup?: keyof typeof CategoryGroupEnum;

  @ValidateIf(
    (i) =>
      i.paymentMethod && !i.category && i.categoryGroup && !i.paymentStatus,
  )
  @IsString()
  @MaxLength(60)
  @IsIn(Object.values(PaymentMethodDescriptionEnum))
  paymentMethod?: keyof typeof PaymentMethodDescriptionEnum;

  @OnlyOnePropertieDefined([
    'category',
    'categoryGroup',
    'paymentStatus',
    'paymentMethod',
  ])
  oneOfValidator?: string;
}
