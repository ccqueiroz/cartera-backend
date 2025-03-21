import { BaseDto } from '@/domain/dtos/baseDto.dto';
import { AuthEntitieDTO } from '@/domain/Auth/dtos/auth.dto';
import { PersonUserEntitieDTO } from '@/domain/Person_User/dtos/person-user.dto';
import { CategoryDTO } from '@/domain/Category/dtos/category.dto';
import { PaymentMethodDTO } from '@/domain/Payment_Method/dtos/payment-method.dto';
import { PaymentStatusDTO } from '@/domain/Payment_Status/dtos/payment-status.dto';
import {
  PaginationParams,
  SearchByDate,
  SortOrder,
} from '@/domain/dtos/listParamsDto.dto';

type UserId = AuthEntitieDTO['userId'];
type PersonUserId = PersonUserEntitieDTO['id'];
type CategoryId = CategoryDTO['id'];
type CategoryDescription = CategoryDTO['description'];
type PaymentMethodId = PaymentMethodDTO['id'];
type PaymentMethodDescription = CategoryDTO['description'];
type PaymentStatusId = PaymentStatusDTO['id'];
type PaymentStatusDescription = PaymentStatusDTO['description'];
type InvoiceCardData = {
  paymentCardId: string;
  invoiceCardId: string;
};
type ShoppingListData = {
  shoppingListId: string;
};

export type BillDTO = {
  id?: string;
  personUserId: PersonUserId;
  userId: UserId;
  descriptionBill: string;
  fixedBill: boolean;
  billDate: number | null;
  payDate: number | null;
  payOut: boolean;
  icon: string | null;
  amount: number;
  paymentStatusId: PaymentStatusId;
  paymentStatusDescription: PaymentStatusDescription;
  categoryId: CategoryId;
  categoryDescription: CategoryDescription;
  paymentMethodId: PaymentMethodId;
  paymentMethodDescription: PaymentMethodDescription;
  isPaymentCardBill: boolean;
  invoiceCarData?: InvoiceCardData;
  isShoppingListBill: boolean;
  shoppingListData?: ShoppingListData;
} & BaseDto;
