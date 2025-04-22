import { IsDefined, IsNumber } from '@/packages/clients/class-validator';
import { UserIdAuthValidation } from '../Auth/auth.schema';

export class GetConsolidatedCashFlowByYearValidationDTO extends UserIdAuthValidation {
  @IsDefined()
  @IsNumber()
  year!: number;
}
