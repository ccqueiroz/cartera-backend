import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { TransferController } from '@/features/transfer/infra/http/transfer.controller';

/**
 * @swagger
 * /api/transfer/list-all:
 *   get:
 *     summary: Lista as transferências do usuário autenticado, por competência, ordenadas desc.
 *     tags: [Transfer]
 *     parameters:
 *       - in: query
 *         name: month
 *         schema: { type: integer }
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Size'
 *       - in: query
 *         name: ordering
 *         schema: { type: string, enum: [transferDate, amount, createdAt] }
 *       - $ref: '#/components/parameters/DirectionOrder'
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [paymentMethodDescriptionEnum] }
 *       - $ref: '#/components/parameters/SortValue'
 *       - in: query
 *         name: search_by_date
 *         schema: { type: string, enum: [transferDate, createdAt] }
 *       - $ref: '#/components/parameters/SearchByDateValue'
 *     security:
 *       - sessionCookieAuth: []
 *     responses:
 *       200: { $ref: '#/components/responses/TransferPageResponse' }
 *       400: { $ref: '#/components/responses/ValidationFailed' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export class ListTransfersRoute implements Route {
  public readonly method: HttpMethod = 'get';
  public readonly path: string = 'transfer/list-all';
  public readonly handler: HttpHandler;

  private constructor(
    controller: TransferController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.listAll;
  }

  public static create(
    controller: TransferController,
    middlewares: Middleware[] = [],
  ): ListTransfersRoute {
    return new ListTransfersRoute(controller, middlewares);
  }
}
