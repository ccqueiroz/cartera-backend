import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { BillController } from '@/features/core-finance/bills/infra/http/bill.controller';

/**
 * @swagger
 * /api/bill/list-by-id/:id:
 *   get:
 *     summary: Detalhe da despesa (no + filhas imediatas).
 *     tags: [Bill]
 *     security: [{ sessionCookieAuth: [] }]
 *     responses:
 *       200: { description: OK. }
 *       401: { description: Sessão ausente ou inválida. }
 */
export class GetBillByIdRoute implements Route {
  public readonly method: HttpMethod = 'get';
  public readonly path: string = 'bill/list-by-id/:id';
  public readonly handler: HttpHandler;

  private constructor(
    controller: BillController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.listById;
  }

  public static create(
    controller: BillController,
    middlewares: Middleware[] = [],
  ): GetBillByIdRoute {
    return new GetBillByIdRoute(controller, middlewares);
  }
}
