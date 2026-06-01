import { Route } from '@/shared/http/route';
import { HealthController } from '@/features/health/infra/http/health.controller';
import { HealthRoute } from '@/features/health/infra/http/health.route';

export function healthRoutes(controller: HealthController): Route[] {
  return [HealthRoute.create(controller)];
}
