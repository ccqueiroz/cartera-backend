import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { HealthController } from '@/features/health/infra/http/health.controller';

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Verifica a saúde do serviço.
 *     description: Rota pública de liveness; retorna o status e o uptime do processo.
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Serviço no ar.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 uptimeSeconds:
 *                   type: number
 *                   example: 1234
 */
export class HealthRoute implements Route {
  public readonly method: HttpMethod = 'get';
  public readonly path: string = 'health';
  public readonly handler: HttpHandler;

  private constructor(
    controller: HealthController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.handle;
  }

  public static create(
    controller: HealthController,
    middlewares: Middleware[] = [],
  ): HealthRoute {
    return new HealthRoute(controller, middlewares);
  }
}
