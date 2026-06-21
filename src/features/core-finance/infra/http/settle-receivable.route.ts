import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { ReceivableController } from '@/features/core-finance/receivables/infra/http/receivable.controller';

/**
 * @swagger
 * /api/receivable/settle/:id:
 *   patch:
 *     summary: Recebe uma parcela (liquidacao atomica creditando a wallet).
 *     tags: [Receivable]
 *     security: [{ sessionCookieAuth: [] }]
 *     responses:
 *       200: { description: OK. }
 *       401: { description: Sessão ausente ou inválida. }
 */
export class SettleReceivableRoute implements Route {
  public readonly method: HttpMethod = 'patch';
  public readonly path: string = 'receivable/settle/:id';
  public readonly handler: HttpHandler;

  private constructor(
    controller: ReceivableController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.settle;
  }

  public static create(
    controller: ReceivableController,
    middlewares: Middleware[] = [],
  ): SettleReceivableRoute {
    return new SettleReceivableRoute(controller, middlewares);
  }
}
