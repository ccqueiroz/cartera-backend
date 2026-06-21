import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { BillController } from '@/features/core-finance/bills/infra/http/bill.controller';

/**
 * @swagger
 * /api/bill/list-unpaid-by-period:
 *   get:
 *     summary: Lista despesas nao pagas no intervalo de vencimento.
 *     tags: [Bill]
 *     security: [{ sessionCookieAuth: [] }]
 *     responses:
 *       200: { description: OK. }
 *       401: { description: Sessão ausente ou inválida. }
 */
export class ListUnpaidBillsByPeriodRoute implements Route {
  public readonly method: HttpMethod = 'get';
  public readonly path: string = 'bill/list-unpaid-by-period';
  public readonly handler: HttpHandler;

  private constructor(
    controller: BillController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.listUnpaidByPeriod;
  }

  public static create(
    controller: BillController,
    middlewares: Middleware[] = [],
  ): ListUnpaidBillsByPeriodRoute {
    return new ListUnpaidBillsByPeriodRoute(controller, middlewares);
  }
}
