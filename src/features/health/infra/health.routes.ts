import { Route } from '@/shared/http/route';
import { HealthController } from './health.controller';

export function healthRoutes(controller: HealthController): Route[] {
  return [{ method: 'get', path: 'health', handler: controller.handle }];
}
