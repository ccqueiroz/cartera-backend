import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { ReceivableController } from '@/features/core-finance/receivables/infra/http/receivable.controller';

/**
 * @swagger
 * /api/receivable/list-unreceived-by-period:
 *   get:
 *     summary: Lista receitas nao recebidas no intervalo de vencimento.
 *     tags: [Receivable]
 *     security: [{ sessionCookieAuth: [] }]
 *     responses:
 *       200: { description: OK. }
 *       400: { description: Datas inválidas. }
 *       401: { description: Sessão ausente ou inválida. }
 */
export class ListUnreceivedReceivablesByPeriodRoute implements Route {
  public readonly method: HttpMethod = 'get';
  public readonly path: string = 'receivable/list-unreceived-by-period';
  public readonly handler: HttpHandler;

  private constructor(
    controller: ReceivableController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.listUnreceivedByPeriod;
  }

  public static create(
    controller: ReceivableController,
    middlewares: Middleware[] = [],
  ): ListUnreceivedReceivablesByPeriodRoute {
    return new ListUnreceivedReceivablesByPeriodRoute(controller, middlewares);
  }
}
