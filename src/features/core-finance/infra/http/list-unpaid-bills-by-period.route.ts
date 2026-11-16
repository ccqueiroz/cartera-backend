import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { BillController } from '@/features/core-finance/bills/infra/http/bill.controller';

/**
 * @swagger
 * /api/bill/unpaid-by-period:
 *   get:
 *     summary: Lista despesas nao pagas no intervalo de vencimento.
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
 *       - in: query
 *         name: start_date
 *         required: true
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: end_date
 *         required: true
 *         schema: { type: string, format: date }
 *     security: [{ sessionCookieAuth: [] }]
 *     responses:
 *       200: { $ref: '#/components/responses/TransactionPageResponse' }
 *       400: { $ref: '#/components/responses/ValidationFailed' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export class ListUnpaidBillsByPeriodRoute implements Route {
  public readonly method: HttpMethod = 'get';
  public readonly path: string = 'bill/unpaid-by-period';
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
