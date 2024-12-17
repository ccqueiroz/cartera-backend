import { BaseDto } from '@/domain/dtos/baseDto.dto';

export type PaymentStatusDTO = {
  id: string;
  description: string;
} & BaseDto;
