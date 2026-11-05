import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { ReceivableController } from '@/features/core-finance/receivables/infra/http/receivable.controller';

/**
 * @swagger
 * /api/receivable/list-unreceived-by-period:
 *   get:
 *     summary: Lista receitas nao recebidas no intervalo de vencimento.
 *     tags: [Receivable]
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
