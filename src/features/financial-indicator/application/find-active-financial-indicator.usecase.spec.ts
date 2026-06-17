import { FindActiveFinancialIndicatorUseCase } from './find-active-financial-indicator.usecase';
import { FinancialIndicator } from '@/features/financial-indicator/domain/financial-indicator.entity';
import { FinancialIndicatorDescriptionEnum } from '@/features/financial-indicator/domain/enums/financial-indicator-description.enum';
import { FinancialIndicatorPeriodEnum } from '@/features/financial-indicator/domain/enums/financial-indicator-period.enum';
import { FinancialIndicatorRefMonthEnum } from '@/features/financial-indicator/domain/enums/financial-indicator-ref-month.enum';

function activeIof() {
  return FinancialIndicator.create({
    id: 'fi-1',
    name: 'IOF Crédito (PF)',
    descriptionEnum: FinancialIndicatorDescriptionEnum.IOF_CREDIT_PF,
    period: FinancialIndicatorPeriodEnum.DAILY,
    aliquota: 0.000082,
    fixedRate: 0.0038,
    refPeriodMonth: FinancialIndicatorRefMonthEnum.JUN,
    refPeriodYear: 2026,
    active: true,
    createdAt: '2026-06-17T00:00:00.000Z',
  });
}

describe('FindActiveFinancialIndicatorUseCase', () => {
  it('retorna o indicador ativo do enum', async () => {
    const repository = {
      findActiveByEnum: async () => activeIof(),
    } as never;
    const useCase = FindActiveFinancialIndicatorUseCase.create(repository);

    const result = await useCase.execute({
      descriptionEnum: FinancialIndicatorDescriptionEnum.IOF_CREDIT_PF,
    });

    expect(result?.aliquota).toBe(0.000082);
    expect(result?.fixedRate).toBe(0.0038);
    expect(result?.aliquotaTotal).toBe(0.003882);
  });

  it('retorna null quando não há ativo', async () => {
    const repository = { findActiveByEnum: async () => null } as never;
    const useCase = FindActiveFinancialIndicatorUseCase.create(repository);

    const result = await useCase.execute({
      descriptionEnum: FinancialIndicatorDescriptionEnum.IOF_CREDIT_PF,
    });

    expect(result).toBeNull();
  });
});
