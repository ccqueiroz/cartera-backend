import { PaymentMethodDescriptionEnumType } from '@/domain/Payment_Method/dtos/payment-method.dto';
import { PaymentStatusDescriptionEnum } from '@/domain/Payment_Status/dtos/payment-status.dto';
import {
  CategoryDescriptionEnumType,
  CategoryGroupEnumType,
} from '@/domain/Category/dtos/category.dto';

export type SortByStatusInputDTO =
  | {
      paymentStatus: PaymentStatusDescriptionEnum;
      category?: never;
      paymentMethod?: never;
      categoryGroup?: never;
    }
  | {
      paymentStatus?: never;
      category: CategoryDescriptionEnumType;
      paymentMethod?: never;
      categoryGroup?: never;
    }
  | {
      paymentStatus?: never;
      category?: never;
      paymentMethod: PaymentMethodDescriptionEnumType;
      categoryGroup?: never;
    }
  | {
      paymentStatus?: never;
      category?: never;
      paymentMethod?: never;
      categoryGroup: CategoryGroupEnumType;
    };
