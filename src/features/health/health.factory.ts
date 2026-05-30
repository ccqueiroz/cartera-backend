import { Route } from '@/shared/http/route';
import { CheckHealthUseCase } from './application/check-health.usecase';
import { HealthController } from './infra/health.controller';
import { healthRoutes } from './infra/health.routes';

/**
 * Factory da feature: monta use case → controller → rotas e devolve Route[].
 * Padrão de composição (CLAUDE.md §7). Health não tem deps externas.
 */
export function makeHealthModule(): Route[] {
  const useCase = CheckHealthUseCase.create();
  const controller = HealthController.create(useCase);
  return healthRoutes(controller);
}
