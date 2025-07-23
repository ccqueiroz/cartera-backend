import { BaseDto } from '@/domain/dtos/baseDto.dto';
import { PaymentStatusDescriptionEnum } from '../enum/payment-status-description.enum';

export type PaymentStatusDescriptionEnum =
  (typeof PaymentStatusDescriptionEnum)[keyof typeof PaymentStatusDescriptionEnum];

export type PaymentStatusDTO = {
  id: string;
  description: string;
  descriptionEnum: PaymentStatusDescriptionEnum;
} & BaseDto;
