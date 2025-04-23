import {
  IsString,
  IsDefined,
  MaxLength,
} from '@/packages/clients/class-validator';

export class GetPaymentStatusByIdValidationDTO {
  @IsDefined()
  @IsString()
  @MaxLength(60)
  id!: string;
}
