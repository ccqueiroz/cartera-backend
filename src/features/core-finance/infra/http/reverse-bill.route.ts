import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { BillController } from '@/features/core-finance/bills/infra/http/bill.controller';

/**
 * @swagger
 * /api/bill/reverse/{id}:
 *   patch:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     summary: Estorna um pagamento (devolve o caixa na wallet original).
 *     tags: [Bill]
 *     security: [{ sessionCookieAuth: [] }]
 *     responses:
 *       200: { $ref: '#/components/responses/SettleTransactionResultResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       404: { $ref: '#/components/responses/TransactionOrWalletNotFound' }
 *       422: { $ref: '#/components/responses/TransactionReverseRefused' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export class ReverseBillRoute implements Route {
  public readonly method: HttpMethod = 'patch';
  public readonly path: string = 'bill/reverse/:id';
  public readonly handler: HttpHandler;

  private constructor(
    controller: BillController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.reverse;
  }

  public static create(
    controller: BillController,
    middlewares: Middleware[] = [],
  ): ReverseBillRoute {
    return new ReverseBillRoute(controller, middlewares);
  }
}
