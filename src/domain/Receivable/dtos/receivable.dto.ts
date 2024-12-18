import { BaseDto } from '@/domain/dtos/baseDto.dto';
import { AuthEntitieDTO } from '@/domain/Auth/dtos/auth.dto';
import { PersonUserEntitieDTO } from '@/domain/Person_User/dtos/person-user.dto';
import { CategoryDTO } from '@/domain/Category/dtos/category.dto';
import { PaymentMethodDTO } from '@/domain/Payment_Method/dtos/payment-method.dto';
import { PaymentStatusDTO } from '@/domain/Payment_Status/dtos/payment-status.dto';

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
  receivableDate?: number;
  icon?: string;
  amount: number;
  paymentStatusId: PaymentStatusId;
  paymentStatusDescription: PaymentStatusDescription;
  categoryId: CategoryId;
  categoryDescription: CategoryDescription;
  paymentMethodId: PaymentMethodId;
  paymentMethodDescription: PaymentMethodDescription;
} & BaseDto;
