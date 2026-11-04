import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { ReceivableController } from '@/features/core-finance/receivables/infra/http/receivable.controller';

/**
 * @swagger
 * /api/receivable/settle/{id}:
 *   patch:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     summary: Recebe uma parcela (liquidacao atomica creditando a wallet).
 *     tags: [Receivable]
 *     security: [{ sessionCookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [walletId, paidAmount, paymentDate, paymentMethodDescriptionEnum]
 *             properties:
 *               walletId: { type: string }
 *               paidAmount: { type: number }
 *               paymentDate: { type: string }
 *               paymentMethodDescriptionEnum:
 *                 $ref: '#/components/schemas/PaymentMethodDescriptionEnum'
 *     responses:
 *       200: { $ref: '#/components/responses/SettleTransactionResultResponse' }
 *       400: { $ref: '#/components/responses/TransactionSettleBadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       404: { $ref: '#/components/responses/TransactionOrWalletNotFound' }
 *       422: { $ref: '#/components/responses/TransactionSettleRefused' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export class SettleReceivableRoute implements Route {
  public readonly method: HttpMethod = 'patch';
  public readonly path: string = 'receivable/settle/:id';
  public readonly handler: HttpHandler;

  private constructor(
    controller: ReceivableController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.settle;
  }

  public static create(
    controller: ReceivableController,
    middlewares: Middleware[] = [],
  ): SettleReceivableRoute {
    return new SettleReceivableRoute(controller, middlewares);
  }
}
