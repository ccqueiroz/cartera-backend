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
import { SortByStatusInputDTO } from '@/domain/Helpers/dtos/sort-by-status-input.dto';

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
  paymentStatus: PaymentStatusDescriptionEnum;
  categoryId: CategoryId;
  categoryDescription: CategoryDescription;
  categoryDescriptionEnum: CategoryDescriptionEnum;
  categoryGroup: CategoryGroupEnum;
  paymentMethodId?: PaymentMethodId;
  paymentMethodDescription?: PaymentMethodDescription;
  paymentMethodDescriptionEnum?: PaymentMethodDescriptionEnum;
} & BaseDto;

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
  | 'category'
  | 'categoryGroup'
  | 'paymentMethod'
  | 'paymentStatus'
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
  | OrderByField<'category'>
  | OrderByField<'categoryGroup'>
  | OrderByField<'paymentMethod'>
  | OrderByField<'paymentStatus'>
  | OrderByField<'createdAt'>
  | OrderByField<'updatedAt'>;

export type GetReceivablesInputDTO = Omit<
  PaginationParams<SortByStatusInputDTO>,
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
  receivableData: Omit<
    ReceivableDTO,
    'id' | 'paymentStatus' | 'createdAt' | 'updatedAt'
  >;
  userId: string;
};

export type CreateReceivableOutputDTO = Pick<ReceivableDTO, 'id'>;

export type EditReceivableInputDTO = {
  receivableId: string;
  receivableData: Omit<ReceivableDTO, 'paymentStatus' | 'updatedAt'>;
  userId: string;
};

export type EditReceivableByMonthInputDTO = {
  billId: string;
  billData: Required<
    Pick<
      ReceivableDTO,
      | 'receival'
      | 'receivalDate'
      | 'paymentMethodId'
      | 'paymentMethodDescription'
      | 'paymentMethodDescriptionEnum'
    >
  >;
  userId: string;
};

export type DeleteReceivableInputDTO = Required<
  Pick<ReceivableDTO, 'id' | 'userId'>
>;

export type ReceivablesByMonthInputDTO = Required<
  Pick<PaginationParams<unknown>, 'page' | 'size'>
> & {
  period: { initialDate: number; finalDate: number };
  userId: string;
};

export const StatusReceival = {
  PENDING: 'PENDING',
  DUE_SOON: 'DUE_SOON',
  DUE_DAY: 'DUE_DAY',
  OVERDUE: 'OVERDUE',
  RECEIVED: 'RECEIVED',
} as const;

export type ReceivablesByMonthOutputDTO = {
  id: string;
  amount: number;
  descriptionReceivable: string;
  receivableDate: number;
  categoryId: CategoryId;
  categoryDescription: CategoryDescription;
  categoryDescriptionEnum: CategoryDescriptionEnum;
  categoryGroup: CategoryGroupEnum;
  status: (typeof StatusReceival)[keyof typeof StatusReceival];
};
