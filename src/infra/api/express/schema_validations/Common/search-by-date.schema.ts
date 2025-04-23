import { IsNumber, IsOptional } from '@/packages/clients/class-validator';

export class SearchByDateDTO {
  @IsOptional()
  @IsNumber()
  initialDate?: number;

  @IsOptional()
  @IsNumber()
  finalDate?: number;

  @IsOptional()
  @IsNumber()
  exactlyDate?: number;
}
