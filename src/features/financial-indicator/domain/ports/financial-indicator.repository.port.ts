import { FinancialIndicator } from '@/features/financial-indicator/domain/financial-indicator.entity';
import { FinancialIndicatorDescription } from '@/features/financial-indicator/domain/enums/financial-indicator-description.enum';

export interface FinancialIndicatorRepository {
  findActiveByEnum(
    descriptionEnum: FinancialIndicatorDescription,
  ): Promise<FinancialIndicator | null>;
}
