import { BaseDto } from '@/domain/dtos/baseDto.dto';
import { AuthEntitieDTO } from '@/domain/Auth/dtos/auth.dto';
import { PersonUserEntitieDTO } from '@/domain/Person_User/dtos/person-user.dto';
import { CategoryDTO } from '@/domain/Category/dtos/category.dto';
import { PaymentMethodDTO } from '@/domain/Payment_Method/dtos/payment-method.dto';
import { PaymentStatusDTO } from '@/domain/Payment_Status/dtos/payment-status.dto';
import { PaginationParams, SortOrder } from '@/domain/dtos/listParamsDto.dto';
import { SortByStatusInputDTO } from '@/domain/Helpers/dtos/sort-by-status-input.dto';
import { BillSearchByDateDTO } from '@/domain/Helpers/dtos/search-by-date-input.dto';

type UserId = AuthEntitieDTO['userId'];
type PersonUserId = PersonUserEntitieDTO['id'];
type CategoryId = CategoryDTO['id'];
type CategoryDescription = CategoryDTO['description'];
type CategoryDescriptionEnum = CategoryDTO['descriptionEnum'];
type CategoryGroupEnum = CategoryDTO['group'];
type PaymentMethodId = PaymentMethodDTO['id'];
type PaymentMethodDescription = PaymentMethodDTO['description'];
type PaymentMethodDescriptionEnum = PaymentMethodDTO['descriptionEnum'];
type PaymentStatusDescriptionEnum = PaymentStatusDTO['descriptionEnum'];

export type InvoiceCardData = {
  paymentCardId: string;
  invoiceCardId: string;
};
export type ShoppingListData = {
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
  paymentStatus: PaymentStatusDescriptionEnum;
  categoryId: CategoryId;
  categoryDescription: CategoryDescription;
  categoryDescriptionEnum: CategoryDescriptionEnum;
  categoryGroup: CategoryGroupEnum;
  paymentMethodId?: PaymentMethodId;
  paymentMethodDescription?: PaymentMethodDescription;
  paymentMethodDescriptionEnum?: PaymentMethodDescriptionEnum;
  isPaymentCardBill: boolean;
  invoiceCarData?: InvoiceCardData;
  isShoppingListBill: boolean;
  shoppingListData?: ShoppingListData;
} & BaseDto;

export type SortByBillTypeInputDTO = {
  fixedBill?: boolean;
  payOut?: boolean;
  isShoppingListBill?: boolean;
  isPaymentCardBill?: boolean;
  amount?: number;
};

export type ValuesOrderByGetBillsInputDTO =
  | 'amount'
  | 'billDate'
  | 'payDate'
  | 'category'
  | 'categoryGroup'
  | 'paymentMethod'
  | 'paymentStatus'
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
  | OrderByField<'category'>
  | OrderByField<'categoryGroup'>
  | OrderByField<'paymentMethod'>
  | OrderByField<'paymentStatus'>
  | OrderByField<'createdAt'>
  | OrderByField<'updatedAt'>;

export type GetBillsInputDTO = Omit<
  PaginationParams<SortByStatusInputDTO>,
  'searchByDate' | 'ordering'
> & {
  userId: string;
  sortByBills?: SortByBillTypeInputDTO;
  searchByDate?: BillSearchByDateDTO;
  ordering?: OrderByGetBillsInputDTO;
};

export type GetBillByIdInputDTO = Required<Pick<BillDTO, 'id' | 'userId'>>;

export type CreateBillInputDTO = {
  billData: Omit<BillDTO, 'id' | 'paymentStatus' | 'createdAt' | 'updatedAt'>;
  userId: string;
};

export type CreateBillOutputDTO = Pick<BillDTO, 'id'>;

export type EditBillInputDTO = {
  billId: string;
  billData: Omit<BillDTO, 'paymentStatus' | 'updatedAt'>;
  userId: string;
};

export type EditBillByPayableMonthInputDTO = {
  billId: string;
  billData: Required<
    Pick<
      BillDTO,
      | 'payOut'
      | 'payDate'
      | 'paymentMethodId'
      | 'paymentMethodDescription'
      | 'paymentMethodDescriptionEnum'
    >
  >;
  userId: string;
};

export type DeleteBillInputDTO = Required<Pick<BillDTO, 'id' | 'userId'>>;

export type BillsPayableMonthInputDTO = Required<
  Pick<PaginationParams<unknown>, 'page' | 'size'>
> & {
  period: { initialDate: number; finalDate: number };
  userId: string;
};

export const StatusBill = {
  PENDING: 'PENDING',
  DUE_SOON: 'DUE_SOON',
  DUE_DAY: 'DUE_DAY',
  OVERDUE: 'OVERDUE',
  PAID: 'PAID',
} as const;

export type BillsPayableMonthOutPutDTO = {
  id: string;
  amount: number;
  descriptionBill: string;
  billDate: number;
  categoryId: CategoryId;
  categoryDescription: CategoryDescription;
  categoryDescriptionEnum: CategoryDescriptionEnum;
  categoryGroup: CategoryGroupEnum;
  status: (typeof StatusBill)[keyof typeof StatusBill];
};
