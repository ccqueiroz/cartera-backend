import { FinancialIndicatorGateway } from '@/features/wallet/domain/ports/financial-indicator.gateway.port';
import { FindActiveFinancialIndicatorUseCase } from '@/features/financial-indicator/application/find-active-financial-indicator.usecase';
import { FinancialIndicatorDescriptionEnum } from '@/features/financial-indicator/domain/enums/financial-indicator-description.enum';
import { DEFAULT_OVERDRAFT_IOF_DAILY_RATE } from '@/features/wallet/domain/overdraft-defaults';

interface FinancialIndicatorInternal {
  findActive: FindActiveFinancialIndicatorUseCase;
}

/**
 * Mora no bootstrap: nem wallet nem financial-indicator importam a outra — só o
 * composition root conhece os dois lados (mesmo padrão do person.gateway).
 */
export class FinancialIndicatorGatewayAdapter
  implements FinancialIndicatorGateway
{
  private constructor(
    private readonly indicatorInternal: FinancialIndicatorInternal,
  ) {}

  public static create(
    indicatorInternal: FinancialIndicatorInternal,
  ): FinancialIndicatorGatewayAdapter {
    return new FinancialIndicatorGatewayAdapter(indicatorInternal);
  }

  public async getActiveIofDailyRate(): Promise<number> {
    const indicator = await this.indicatorInternal.findActive.execute({
      descriptionEnum: FinancialIndicatorDescriptionEnum.IOF_CREDIT_PF,
    });
    return indicator?.aliquotaTotal ?? DEFAULT_OVERDRAFT_IOF_DAILY_RATE;
  }
}
