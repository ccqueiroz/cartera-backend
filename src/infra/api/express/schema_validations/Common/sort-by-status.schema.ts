import {
  IsString,
  ValidateIf,
  MaxLength,
  OnlyOnePropertieDefined,
} from '@/packages/clients/class-validator';

export class SortByStatusDTO {
  @ValidateIf((i) => i.paymentStatusId && !i.categoryId && !i.paymentMethodId)
  @IsString()
  @MaxLength(60)
  paymentStatusId?: string;

  @ValidateIf((i) => i.categoryId && !i.paymentStatusId && !i.paymentMethodId)
  @IsString()
  @MaxLength(60)
  categoryId?: string;

  @ValidateIf((i) => i.paymentMethodId && !i.categoryId && !i.paymentStatusId)
  @IsString()
  @MaxLength(60)
  paymentMethodId?: string;

  @OnlyOnePropertieDefined(['categoryId', 'paymentStatusId', 'paymentMethodId'])
  oneOfValidator?: string;
}
