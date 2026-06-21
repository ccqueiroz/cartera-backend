import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { ReceivableController } from '@/features/core-finance/receivables/infra/http/receivable.controller';

/**
 * @swagger
 * /api/receivable/global-settlement/:id:
 *   patch:
 *     summary: Recebimento global (credito total + um movimento por folha).
 *     tags: [Receivable]
 *     security: [{ sessionCookieAuth: [] }]
 *     responses:
 *       200: { description: OK. }
 *       401: { description: Sessão ausente ou inválida. }
 */
export class GlobalSettleReceivableRoute implements Route {
  public readonly method: HttpMethod = 'patch';
  public readonly path: string = 'receivable/global-settlement/:id';
  public readonly handler: HttpHandler;

  private constructor(
    controller: ReceivableController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.globalSettlement;
  }

  public static create(
    controller: ReceivableController,
    middlewares: Middleware[] = [],
  ): GlobalSettleReceivableRoute {
    return new GlobalSettleReceivableRoute(controller, middlewares);
  }
}
