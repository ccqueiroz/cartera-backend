import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { ReceivableController } from '@/features/core-finance/receivables/infra/http/receivable.controller';

/**
 * @swagger
 * /api/receivable/{receivable_id}:
 *   get:
 *     parameters:
 *       - in: path
 *         name: receivable_id
 *         required: true
 *         schema: { type: string }
 *     summary: Detalhe da receita (no + filhas imediatas).
 *     tags: [Receivable]
 *     security: [{ sessionCookieAuth: [] }]
 *     responses:
 *       200: { $ref: '#/components/responses/TransactionDetailResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       404: { $ref: '#/components/responses/TransactionNotFound' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export class GetReceivableByIdRoute implements Route {
  public readonly method: HttpMethod = 'get';
  public readonly path: string = 'receivable/:receivable_id';
  public readonly handler: HttpHandler;

  private constructor(
    controller: ReceivableController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.listById;
  }

  public static create(
    controller: ReceivableController,
    middlewares: Middleware[] = [],
  ): GetReceivableByIdRoute {
    return new GetReceivableByIdRoute(controller, middlewares);
  }
}
