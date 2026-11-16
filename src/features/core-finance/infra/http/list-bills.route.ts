import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { BillController } from '@/features/core-finance/bills/infra/http/bill.controller';

/**
 * @swagger
 * /api/bill:
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
 *       - in: query
 *         name: scope
 *         schema: { type: string }
 *       - in: query
 *         name: month
 *         schema: { type: integer }
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *       - in: query
 *         name: category_description_enum
 *         schema: { type: string }
 *       - in: query
 *         name: payment_method_description_enum
 *         schema: { type: string }
 *       - in: query
 *         name: root_has_installments
 *         schema: { type: boolean }
 *       - in: query
 *         name: root_is_fixed_cost
 *         schema: { type: boolean }
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
  public readonly path: string = 'bill';
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
