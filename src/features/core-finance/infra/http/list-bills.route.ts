import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { BillController } from '@/features/core-finance/bills/infra/http/bill.controller';

/**
 * @swagger
 * /api/bill/list-all:
 *   get:
 *     summary: Lista despesas por competencia (folhas, filtros do motor).
 *     tags: [Bill]
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Size'
 *       - $ref: '#/components/parameters/TransactionOrdering'
 *       - $ref: '#/components/parameters/DirectionOrder'
 *       - $ref: '#/components/parameters/TransactionSort'
 *       - $ref: '#/components/parameters/SortValue'
 *       - $ref: '#/components/parameters/TransactionSearchByDate'
 *       - $ref: '#/components/parameters/SearchByDateValue'
 *     security: [{ sessionCookieAuth: [] }]
 *     responses:
 *       200: { $ref: '#/components/responses/TransactionPageResponse' }
 *       400: { $ref: '#/components/responses/ValidationFailed' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
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
