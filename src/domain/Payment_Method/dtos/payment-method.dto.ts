import { BaseDto } from '@/domain/dtos/baseDto.dto';

export type PaymentMethodDTO = {
  id: string;
  description: string;
} & BaseDto;
