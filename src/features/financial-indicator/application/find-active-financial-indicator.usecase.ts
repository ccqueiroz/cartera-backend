import { FinancialIndicator } from '@/features/financial-indicator/domain/financial-indicator.entity';
import { FinancialIndicatorRepository } from '@/features/financial-indicator/domain/ports/financial-indicator.repository.port';
import { FinancialIndicatorDescription } from '@/features/financial-indicator/domain/enums/financial-indicator-description.enum';

export class FindActiveFinancialIndicatorUseCase {
  private constructor(
    private readonly repository: FinancialIndicatorRepository,
  ) {}

  public static create(
    repository: FinancialIndicatorRepository,
  ): FindActiveFinancialIndicatorUseCase {
    return new FindActiveFinancialIndicatorUseCase(repository);
  }

  public async execute(input: {
    descriptionEnum: FinancialIndicatorDescription;
  }): Promise<FinancialIndicator | null> {
    return this.repository.findActiveByEnum(input.descriptionEnum);
  }
}
