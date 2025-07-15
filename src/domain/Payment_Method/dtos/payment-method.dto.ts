import { BaseDto } from '@/domain/dtos/baseDto.dto';
import { PaymentMethodDescriptionEnum } from '../enums/payment-method-description.enum';

export type PaymentMethodDescriptionEnumType =
  (typeof PaymentMethodDescriptionEnum)[keyof typeof PaymentMethodDescriptionEnum];

export type PaymentMethodDTO = {
  id: string;
  description: string;
  descriptionEnum: PaymentMethodDescriptionEnumType;
} & BaseDto;
