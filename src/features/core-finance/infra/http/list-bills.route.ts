import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { BillController } from '@/features/core-finance/bills/infra/http/bill.controller';

/**
 * @swagger
 * /api/bill/list-all:
 *   get:
 *     summary: Lista despesas por competencia (folhas, filtros do motor).
 *     tags: [Bill]
 *     security: [{ sessionCookieAuth: [] }]
 *     responses:
 *       200: { description: OK. }
 *       401: { description: Sessão ausente ou inválida. }
 */
export class ListBillsRoute implements Route {
  public readonly method: HttpMethod = 'get';
  public readonly path: string = 'bill/list-all';
  public readonly handler: HttpHandler;

  private constructor(
    controller: BillController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.listAll;
  }

  public static create(
    controller: BillController,
    middlewares: Middleware[] = [],
  ): ListBillsRoute {
    return new ListBillsRoute(controller, middlewares);
  }
}
