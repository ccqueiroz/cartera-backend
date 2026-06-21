import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { BillController } from '@/features/core-finance/bills/infra/http/bill.controller';

/**
 * @swagger
 * /api/bill/global-settlement/:id:
 *   patch:
 *     summary: Quitacao global (debito total + um movimento por folha).
 *     tags: [Bill]
 *     security: [{ sessionCookieAuth: [] }]
 *     responses:
 *       200: { description: OK. }
 *       401: { description: Sessão ausente ou inválida. }
 */
export class GlobalSettleBillRoute implements Route {
  public readonly method: HttpMethod = 'patch';
  public readonly path: string = 'bill/global-settlement/:id';
  public readonly handler: HttpHandler;

  private constructor(
    controller: BillController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.globalSettlement;
  }

  public static create(
    controller: BillController,
    middlewares: Middleware[] = [],
  ): GlobalSettleBillRoute {
    return new GlobalSettleBillRoute(controller, middlewares);
  }
}
