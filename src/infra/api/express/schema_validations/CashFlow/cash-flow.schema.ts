import {
  IsBoolean,
  IsDefined,
  IsNumber,
  IsOptional,
} from '@/packages/clients/class-validator';
import { UserIdAuthValidation } from '../Auth/auth.schema';

export class GetConsolidatedCashFlowByYearValidationDTO extends UserIdAuthValidation {
  @IsDefined()
  @IsNumber()
  year!: number;
}

export class GetMonthlySummaryCashFlowValidationDTO extends UserIdAuthValidation {
  @IsDefined()
  @IsNumber()
  year!: number;

  @IsDefined()
  @IsNumber()
  month!: number;

  @IsOptional()
  @IsBoolean()
  paid?: boolean;
}
