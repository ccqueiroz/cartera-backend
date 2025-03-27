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

export type SortByStatusBillsInputDTO =
  | { paymentStatusId: string; categoryId?: never; paymentMethodId?: never }
  | { paymentStatusId?: never; categoryId: string; paymentMethodId?: never }
  | { paymentStatusId?: never; categoryId?: never; paymentMethodId: string };

export type SortByBillTypeInputDTO = {
  fixedBill?: boolean;
  payOut?: boolean;
  isShoppingListBill?: boolean;
  isPaymentCardBill?: boolean;
  amount?: number;
};

export type SearchByDateGetBillsInputDTO =
  | { billDate: SearchByDate; payDate?: never }
  | { payDate: SearchByDate; billDate?: never };

export type ValuesOrderByGetBillsInputDTO =
  | 'amount'
  | 'billDate'
  | 'payDate'
  | 'categoryId'
  | 'paymentMethodId'
  | 'paymentStatusId'
  | 'createdAt'
  | 'updatedAt';

export type OrderByField<T extends ValuesOrderByGetBillsInputDTO> = {
  [K in T]: SortOrder;
} & {
  [K in Exclude<ValuesOrderByGetBillsInputDTO, T>]?: never;
};

export type OrderByGetBillsInputDTO =
  | OrderByField<'amount'>
  | OrderByField<'billDate'>
  | OrderByField<'payDate'>
  | OrderByField<'categoryId'>
  | OrderByField<'paymentMethodId'>
  | OrderByField<'paymentStatusId'>
  | OrderByField<'createdAt'>
  | OrderByField<'updatedAt'>;

export type GetBillsInputDTO = Omit<
  PaginationParams<SortByStatusBillsInputDTO>,
  'searchByDate' | 'ordering'
> & {
  userId: string;
  sortByBills?: SortByBillTypeInputDTO;
  searchByDate?: SearchByDateGetBillsInputDTO;
  ordering?: OrderByGetBillsInputDTO;
};

export type GetBillByIdInputDTO = Required<Pick<BillDTO, 'id' | 'userId'>>;

export type CreateBillInputDTO = {
  billData: Omit<BillDTO, 'id' | 'updatedAt'>;
  userId: string;
};

export type CreateBillOutputDTO = Pick<BillDTO, 'id'>;

export type EditBillInputDTO = {
  billId: string;
  billData: BillDTO;
  userId: string;
};

export type DeleteBillInputDTO = Required<Pick<BillDTO, 'id' | 'userId'>>;
