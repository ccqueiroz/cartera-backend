import type { Request, Response } from 'express';
import { CheckHealthUseCase } from '@/features/health/application/check-health.usecase';

export class HealthController {
  private constructor(private readonly useCase: CheckHealthUseCase) {}

  public static create(useCase: CheckHealthUseCase): HealthController {
    return new HealthController(useCase);
  }

  public handle = (_req: Request, res: Response): void => {
    res.status(200).json(this.useCase.execute());
  };
}
