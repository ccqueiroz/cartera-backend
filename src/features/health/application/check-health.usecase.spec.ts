import { CheckHealthUseCase } from './check-health.usecase';

describe('CheckHealthUseCase', () => {
  it('returns ok status with uptime truncated to an integer', () => {
    const useCase = CheckHealthUseCase.create(() => 12.9);
    expect(useCase.execute()).toEqual({ status: 'ok', uptimeSeconds: 12 });
  });

  it('uses process.uptime by default', () => {
    const result = CheckHealthUseCase.create().execute();
    expect(result.status).toBe('ok');
    expect(result.uptimeSeconds).toBeGreaterThanOrEqual(0);
  });
});
