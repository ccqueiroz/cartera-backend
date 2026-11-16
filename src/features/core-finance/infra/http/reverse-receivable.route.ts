import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { ReceivableController } from '@/features/core-finance/receivables/infra/http/receivable.controller';

/**
 * @swagger
 * /api/receivable/{receivable_id}/reverse:
 *   patch:
 *     parameters:
 *       - in: path
 *         name: receivable_id
 *         required: true
 *         schema: { type: string }
 *     summary: Estorna um recebimento (debita o caixa na wallet original).
 *     tags: [Receivable]
 *     security: [{ sessionCookieAuth: [] }]
 *     responses:
 *       200: { $ref: '#/components/responses/SettleTransactionResultResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       404: { $ref: '#/components/responses/TransactionOrWalletNotFound' }
 *       422: { $ref: '#/components/responses/TransactionReverseRefused' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export class ReverseReceivableRoute implements Route {
  public readonly method: HttpMethod = 'patch';
  public readonly path: string = 'receivable/:receivable_id/reverse';
  public readonly handler: HttpHandler;

  private constructor(
    controller: ReceivableController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.reverse;
  }

  public static create(
    controller: ReceivableController,
    middlewares: Middleware[] = [],
  ): ReverseReceivableRoute {
    return new ReverseReceivableRoute(controller, middlewares);
  }
}
