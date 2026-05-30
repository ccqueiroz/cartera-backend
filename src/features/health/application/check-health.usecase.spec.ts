import { CheckHealthUseCase } from './check-health.usecase';

describe('CheckHealthUseCase', () => {
  it('retorna status ok com uptime truncado para inteiro', () => {
    const useCase = CheckHealthUseCase.create(() => 12.9);
    expect(useCase.execute()).toEqual({ status: 'ok', uptimeSeconds: 12 });
  });

  it('usa process.uptime por padrão', () => {
    const result = CheckHealthUseCase.create().execute();
    expect(result.status).toBe('ok');
    expect(result.uptimeSeconds).toBeGreaterThanOrEqual(0);
  });
});
