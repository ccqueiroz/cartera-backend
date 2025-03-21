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

export type ReceivableDTO = {
  id?: string;
  personUserId: PersonUserId;
  userId: UserId;
  descriptionReceivable: string;
  fixedReceivable: boolean;
  receivableDate: number | null;
  receivalDate: number | null;
  receival: boolean;
  icon: string | null;
  amount: number;
  paymentStatusId: PaymentStatusId;
  paymentStatusDescription: PaymentStatusDescription;
  categoryId: CategoryId;
  categoryDescription: CategoryDescription;
  paymentMethodId: PaymentMethodId;
  paymentMethodDescription: PaymentMethodDescription;
} & BaseDto;

export type SortByStatusReceivablesInputDTO =
  | { paymentStatusId: string; categoryId?: never; paymentMethodId?: never }
  | { paymentStatusId?: never; categoryId: string; paymentMethodId?: never }
  | { paymentStatusId?: never; categoryId?: never; paymentMethodId: string };

export type SortByReceivableTypeInputDTO = {
  fixedReceivable?: boolean;
  receival?: boolean;
  amount?: number;
};

export type SearchByDateGetReceivablesInputDTO =
  | { receivableDate: SearchByDate; receivalDate?: never }
  | { receivalDate: SearchByDate; receivableDate?: never };

export type ValuesOrderByGetReceivablesInputDTO =
  | 'amount'
  | 'receivableDate'
  | 'receivalDate'
  | 'categoryId'
  | 'paymentMethodId'
  | 'paymentStatusId'
  | 'createdAt'
  | 'updatedAt';

export type OrderByField<T extends ValuesOrderByGetReceivablesInputDTO> = {
  [K in T]: SortOrder;
} & {
  [K in Exclude<ValuesOrderByGetReceivablesInputDTO, T>]?: never;
};

export type OrderByGetReceivablesInputDTO =
  | OrderByField<'amount'>
  | OrderByField<'receivableDate'>
  | OrderByField<'receivalDate'>
  | OrderByField<'categoryId'>
  | OrderByField<'paymentMethodId'>
  | OrderByField<'paymentStatusId'>
  | OrderByField<'createdAt'>
  | OrderByField<'updatedAt'>;

export type GetReceivablesInputDTO = Omit<
  PaginationParams<SortByStatusReceivablesInputDTO>,
  'searchByDate' | 'ordering'
> & {
  userId: string;
  sortByReceivables?: SortByReceivableTypeInputDTO;
  searchByDate?: SearchByDateGetReceivablesInputDTO;
  ordering?: OrderByGetReceivablesInputDTO;
};

export type GetReceivableByIdInputDTO = Required<
  Pick<ReceivableDTO, 'id' | 'userId'>
>;

export type DataAuthByRequest = Pick<AuthEntitieDTO, 'userId' | 'email'>;

export type CreateReceivableInputDTO = {
  receivableData: Omit<ReceivableDTO, 'id' | 'updatedAt'>;
  userId: string;
};

export type CreateReceivableOutputDTO = Pick<ReceivableDTO, 'id'>;

export type EditReceivableInputDTO = {
  receivableId: string;
  receivableData: ReceivableDTO;
  userId: string;
};

export type DeleteReceivableInputDTO = Required<
  Pick<ReceivableDTO, 'id' | 'userId'>
>;
