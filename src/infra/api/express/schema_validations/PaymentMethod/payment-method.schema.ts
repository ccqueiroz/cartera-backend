import {
  IsString,
  IsDefined,
  MaxLength,
} from '@/packages/clients/class-validator';

export class GetPaymentMethodByIdValidationDTO {
  @IsDefined()
  @IsString()
  @MaxLength(60)
  id!: string;
}
