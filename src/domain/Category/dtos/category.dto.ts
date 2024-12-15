import { BaseDto } from '@/domain/dtos/baseDto.dto';

export type CategoryDTO = {
  id: string;
  description: string;
} & BaseDto;
